import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { CharacterDef } from '../characters';
import type { WeaponDef } from '../weapons';
import { buildPlaceholder } from './placeholder';
import { detectRig, PART_CHILDREN, PART_IDS, type PartId, type Rig } from './rig';

const LIMB_HP = 30;
const HEAD_FINISH_RATIO = 0.3; // kafa ancak can bu oranın altındayken kopar (bitirici vuruş)
const SEVER_BONUS = 20;

interface PartState {
  bone: THREE.Bone;
  hp: number;
  severed: boolean;
}

interface Spring {
  ang: THREE.Vector3; // dünya uzayında eksen-açı vektörü
  vel: THREE.Vector3;
}

export interface SeverResult {
  part: PartId;
  /** Kopan parçanın o anki pozda "pişirilmiş" statik kopyası (dünya uzayında). */
  gib: THREE.Group | null;
  joint: THREE.Vector3;
  radius: number;
  /** Güdükte kan damlatmak için: kesik noktasının bağlı olduğu kemik + yerel konum. */
  stumpParent: THREE.Object3D;
  stumpLocal: THREE.Vector3;
}

export interface HitResult {
  damage: number;
  crit: boolean;
  severed: SeverResult | null;
  killed: boolean;
}

const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _q3 = new THREE.Quaternion();
const _e = new THREE.Euler();

export class Character {
  readonly root = new THREE.Group();
  readonly meshes: THREE.SkinnedMesh[] = [];
  readonly parts = new Map<PartId, PartState>();
  readonly maxHp: number;
  hp: number;
  dead = false;
  /** Tripo modeli mi yoksa geçici model mi kullanılıyor. */
  usingPlaceholder = true;

  private rig!: Rig;
  private bones: THREE.Bone[] = [];
  private rest = new Map<THREE.Bone, THREE.Quaternion>();
  private partOfBone = new Map<THREE.Object3D, PartId | null>();
  private springs = new Map<THREE.Bone, Spring>();
  private saved: [THREE.Bone, THREE.Quaternion][] = [];
  private savedSet = new Set<THREE.Bone>();
  private severedBones: THREE.Bone[] = [];
  private cauterized: { mat: THREE.MeshStandardMaterial; t: number }[] = [];
  private mixer: THREE.AnimationMixer | null = null;
  private time = Math.random() * 10;
  private talkT = 0;
  private knock = new THREE.Vector3();
  private knockVel = new THREE.Vector3();
  private drop = 0;
  private dropTarget = 0;
  private deadT = 0;
  private legLen = { thigh: 0.4, shin: 0.4 };

  private constructor(readonly def: CharacterDef) {
    this.maxHp = this.hp = def.hp;
  }

  static async create(def: CharacterDef): Promise<Character> {
    const c = new Character(def);
    let model: THREE.Object3D | null = null;
    let clips: THREE.AnimationClip[] = [];

    const url = def.model?.url ?? `models/${def.id}.glb`;
    try {
      const gltf = await new GLTFLoader().loadAsync(url);
      let hasSkin = false;
      gltf.scene.traverse((o) => {
        if ((o as THREE.SkinnedMesh).isSkinnedMesh) hasSkin = true;
      });
      if (hasSkin) {
        model = gltf.scene;
        clips = gltf.animations;
        c.usingPlaceholder = false;
      } else {
        console.warn(`[character] ${url} içinde rig (SkinnedMesh) yok; Tripo'da rigleyip öyle dışa aktarın. Geçici model kullanılıyor.`);
      }
    } catch {
      // Model henüz eklenmemiş: geçici karakterle devam.
    }
    if (!model) model = buildPlaceholder(def.look);

    c.setup(model, clips);
    return c;
  }

  private setup(model: THREE.Object3D, clips: THREE.AnimationClip[]) {
    const cfg = this.def.model ?? {};
    const boneSet = new Set<THREE.Bone>();
    model.traverse((o) => {
      const m = o as THREE.SkinnedMesh;
      if (m.isSkinnedMesh) {
        m.frustumCulled = false;
        m.castShadow = true;
        this.meshes.push(m);
        m.skeleton.bones.forEach((b) => boneSet.add(b));
      }
    });
    this.bones = [...boneSet];

    // Boyu ~2 birime getir, ayakları zemine, merkezi orijine oturt.
    model.rotation.y = cfg.rotationY ?? 0;
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const s = (cfg.height ?? 2.25) / (size.y || 1);
    model.scale.multiplyScalar(s);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x * s, -box.min.y * s, -center.z * s);
    this.root.add(model);
    this.root.updateMatrixWorld(true);

    this.rig = detectRig(this.bones, cfg.boneMap);
    for (const id of PART_IDS) {
      const bone = this.rig.parts[id];
      if (bone) this.parts.set(id, { bone, hp: LIMB_HP, severed: false });
    }
    for (const b of this.bones) this.rest.set(b, b.quaternion.clone());

    // Her kemik için: en yakın "parça" atası (el -> forearm, üst kol -> arm ...).
    const partByBone = new Map<THREE.Object3D, PartId>();
    this.parts.forEach((st, id) => partByBone.set(st.bone, id));
    for (const b of this.bones) {
      let p: THREE.Object3D | null = b;
      let found: PartId | null = null;
      while (p && !found) {
        found = partByBone.get(p) ?? null;
        p = p.parent;
      }
      this.partOfBone.set(b, found);
    }

    // Bacak boyları: iki bacak da gidince gövdeyi yere indirmek için.
    for (const side of ['L', 'R'] as const) {
      const thigh = this.rig.parts[`leg${side}`], shin = this.rig.parts[`shin${side}`];
      if (thigh && shin) {
        const a = thigh.getWorldPosition(new THREE.Vector3());
        const b = shin.getWorldPosition(new THREE.Vector3());
        this.legLen.thigh = a.distanceTo(b);
        this.legLen.shin = b.y; // diz yüksekliği ≈ baldır + ayak
      }
    }

    for (const m of this.meshes) {
      m.computeBoundingSphere();
      m.boundingSphere!.radius *= 1.6; // savrulma payı
    }

    if (clips.length && cfg.useClips !== false) {
      const clip =
        (cfg.idleClip && clips.find((c) => c.name === cfg.idleClip)) ||
        clips.find((c) => /idle|stand|breath/i.test(c.name)) ||
        clips[0];
      this.mixer = new THREE.AnimationMixer(model);
      this.mixer.clipAction(clip).play();
    }
  }

  // ---------------------------------------------------------------- isabet

  /** Raycast isabetinden vücut parçasını bulur (köşenin en baskın kemiğine bakarak). */
  partFromHit(hit: THREE.Intersection): PartId | null {
    const mesh = hit.object as THREE.SkinnedMesh;
    if (!hit.face || !mesh.isSkinnedMesh) return null;
    const bone = mesh.skeleton.bones[this.dominantBone(mesh, hit.face.a)];
    const part = this.partOfBone.get(bone) ?? null;
    return part && !this.parts.get(part)!.severed ? part : null;
  }

  private dominantBone(mesh: THREE.SkinnedMesh, v: number): number {
    const si = mesh.geometry.attributes.skinIndex, sw = mesh.geometry.attributes.skinWeight;
    let best = 0, bw = -1;
    for (let k = 0; k < 4; k++) {
      const w = sw.getComponent(v, k);
      if (w > bw) {
        bw = w;
        best = si.getComponent(v, k);
      }
    }
    return best;
  }

  hit(h: { point: THREE.Vector3; dir: THREE.Vector3; part: PartId | null; weapon: WeaponDef }): HitResult {
    const res: HitResult = { damage: 0, crit: false, severed: null, killed: false };
    if (this.dead) return res;
    const w = h.weapon;

    res.crit = h.part === 'head';
    res.damage = Math.round(w.damage * (res.crit ? 1.5 : 1));

    // Tepki: vurulan kemik + ataları, kaldıraç koluna göre savrulur.
    const bone = h.part ? this.parts.get(h.part)!.bone : this.rig.spine[this.rig.spine.length - 1] ?? this.rig.hips;
    if (bone) this.impulse(bone, h.point, h.dir, w.force);
    this.knockVel.addScaledVector(h.dir, w.force * 0.12);

    // Uzuv koparma
    if (h.part && w.sever > 0) {
      const st = this.parts.get(h.part)!;
      if (h.part === 'head') {
        if ((this.hp - res.damage) / this.maxHp <= HEAD_FINISH_RATIO) {
          res.severed = this.sever('head', !!w.cauterize);
          res.damage = this.hp; // kafa gitti: bitti
        }
      } else {
        st.hp -= w.sever;
        if (st.hp <= 0) {
          res.severed = this.sever(h.part, !!w.cauterize);
          res.damage += SEVER_BONUS;
        }
      }
    }

    res.damage = Math.min(res.damage, this.hp);
    this.hp -= res.damage;
    if (this.hp <= 0) {
      this.dead = true;
      res.killed = true;
      this.knockVel.addScaledVector(h.dir, 2);
    }
    return res;
  }

  private impulse(bone: THREE.Bone, point: THREE.Vector3, dir: THREE.Vector3, force: number) {
    let falloff = 1;
    let b: THREE.Object3D | null = bone;
    while (b && (b as THREE.Bone).isBone && falloff > 0.08) {
      const r = _v.copy(point).sub(b.getWorldPosition(new THREE.Vector3()));
      const torque = new THREE.Vector3().crossVectors(r, dir);
      if (torque.lengthSq() < 1e-5) torque.set(dir.z, 0, -dir.x); // tam eklemden vurulduysa: geriye yatır
      torque.normalize().multiplyScalar(force * falloff);
      this.spring(b as THREE.Bone).vel.add(torque);
      falloff *= 0.5;
      b = b.parent;
    }
  }

  private spring(b: THREE.Bone): Spring {
    let s = this.springs.get(b);
    if (!s) this.springs.set(b, (s = { ang: new THREE.Vector3(), vel: new THREE.Vector3() }));
    return s;
  }

  // ---------------------------------------------------------------- koparma

  /**
   * Uzvu koparır. Herhangi bir rig'li mesh ile çalışır:
   *  1) Kopan kemik alt ağacına ağırlıklı üçgenler o anki pozda pişirilip bağımsız bir parça olur.
   *  2) Kemik ~0'a ölçeklenir; gövdedeki uzuv ekleme doğru büzülüp kaybolur.
   *  3) Kesik yerine (güdük + kopan parça) kapak eklenir.
   */
  sever(part: PartId, cauterize: boolean): SeverResult | null {
    const st = this.parts.get(part);
    if (!st || st.severed) return null;
    const bone = st.bone;
    const parent = bone.parent!;
    const sub = new Set<THREE.Object3D>();
    bone.traverse((o) => sub.add(o));

    this.root.updateMatrixWorld(true);
    const joint = bone.getWorldPosition(new THREE.Vector3());
    const gib = new THREE.Group();
    const boundary: THREE.Vector3[] = [];
    const all: THREE.Vector3[] = [];

    for (const mesh of this.meshes) {
      mesh.skeleton.update();
      const g = mesh.geometry;
      const P = g.attributes.position, UV = g.attributes.uv, COL = g.attributes.color;
      const idx = g.index;
      const inSub = new Int8Array(P.count).fill(-1);
      const isIn = (v: number) => {
        if (inSub[v] < 0) inSub[v] = sub.has(mesh.skeleton.bones[this.dominantBone(mesh, v)]) ? 1 : 0;
        return inSub[v] === 1;
      };
      const baked = new Map<number, THREE.Vector3>();
      const bake = (v: number) => {
        let p = baked.get(v);
        if (!p) {
          p = mesh.getVertexPosition(v, new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);
          baked.set(v, p);
        }
        return p;
      };

      const pos: number[] = [], uv: number[] = [], col: number[] = [];
      const tris = (idx ? idx.count : P.count) / 3;
      for (let t = 0; t < tris; t++) {
        const vs = [0, 1, 2].map((k) => (idx ? idx.getX(t * 3 + k) : t * 3 + k));
        const ins = vs.map(isIn);
        const n = +ins[0] + +ins[1] + +ins[2];
        if (n === 0) continue;
        if (n < 3) vs.forEach((v, k) => ins[k] && boundary.push(bake(v)));
        if (n < 2) continue;
        for (const v of vs) {
          const p = bake(v);
          pos.push(p.x, p.y, p.z);
          all.push(p);
          if (UV) uv.push(UV.getX(v), UV.getY(v));
          if (COL) col.push(COL.getX(v), COL.getY(v), COL.getZ(v));
        }
      }
      if (!pos.length) continue;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      if (UV) geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      if (COL) geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      geo.computeVertexNormals();
      const piece = new THREE.Mesh(geo, mesh.material);
      piece.castShadow = true;
      gib.add(piece);
    }

    // Kesit yarıçapı: sınırdaki köşelerin ekleme uzaklığı; sınır yoksa ekleme en yakın köşeler.
    let ring = boundary;
    if (ring.length < 6 && all.length) {
      ring = [...all].sort((a, b) => a.distanceToSquared(joint) - b.distanceToSquared(joint))
        .slice(0, Math.max(6, Math.floor(all.length * 0.08)));
    }
    let radius = 0.08;
    if (ring.length) {
      radius = ring.reduce((s, p) => s + p.distanceTo(joint), 0) / ring.length;
      radius = THREE.MathUtils.clamp(radius, 0.04, 0.22);
    }

    const capMat = () => {
      const m = new THREE.MeshStandardMaterial(
        cauterize
          ? { color: 0x2a1408, emissive: 0xff5a10, emissiveIntensity: 3, roughness: 0.9 }
          : { color: new THREE.Color(this.def.bloodColor).multiplyScalar(0.55), roughness: 0.35 },
      );
      if (cauterize) this.cauterized.push({ mat: m, t: 0 });
      return m;
    };
    const capGeo = new THREE.SphereGeometry(1, 12, 8);

    // Güdük kapağı: ebeveyn kemiğe, kopan kemiğin yerine.
    const stump = new THREE.Mesh(capGeo, capMat());
    stump.position.copy(bone.position);
    stump.scale.setScalar((radius * 0.95) / parent.getWorldScale(_v).x);
    parent.add(stump);

    let outGib: THREE.Group | null = null;
    if (gib.children.length) {
      // Parçayı kendi ağırlık merkezine taşı ki düzgün dönsün.
      const c = new THREE.Vector3();
      all.forEach((p) => c.add(p));
      c.divideScalar(all.length);
      gib.children.forEach((m) => (m as THREE.Mesh).geometry.translate(-c.x, -c.y, -c.z));
      const cap = new THREE.Mesh(capGeo, capMat());
      cap.position.copy(joint).sub(c);
      cap.scale.setScalar(radius * 0.95);
      gib.add(cap);
      gib.position.copy(c);
      outGib = gib;
    }

    bone.scale.setScalar(1e-4);
    this.severedBones.push(bone);
    st.severed = true;
    const child = PART_CHILDREN[part];
    if (child && this.parts.has(child)) this.parts.get(child)!.severed = true;
    this.updateLegDrop();

    return { part, gib: outGib, joint, radius, stumpParent: parent, stumpLocal: bone.position.clone() };
  }

  private updateLegDrop() {
    const lost = (side: 'L' | 'R') => {
      if (this.parts.get(`leg${side}`)?.severed) return this.legLen.thigh + this.legLen.shin;
      if (this.parts.get(`shin${side}`)?.severed) return this.legLen.shin;
      return 0;
    };
    // Gövde, kalan en uzun bacağın (ya da güdüğün) üstünde durur.
    this.dropTarget = Math.max(0, Math.min(lost('L'), lost('R')) - 0.05);
  }

  // ---------------------------------------------------------------- kare güncellemesi

  /** Konuşurken kafa sallama süresi. */
  talk(seconds: number) {
    this.talkT = seconds;
  }

  headPosition(out: THREE.Vector3): THREE.Vector3 {
    const head = this.parts.get('head');
    if (head && !head.severed) return head.bone.getWorldPosition(out);
    return this.root.getWorldPosition(out).setY(this.root.position.y + 1.6);
  }

  private touch(b: THREE.Bone) {
    if (this.savedSet.has(b)) return;
    this.savedSet.add(b);
    this.saved.push([b, b.quaternion.clone()]);
  }

  update(dt: number) {
    this.time += dt;
    const t = this.time;

    // Geçen karede eklenen prosedürel ofsetleri geri al (animasyon/dinlenme pozu bozulmasın).
    for (const [b, q] of this.saved) b.quaternion.copy(q);
    this.saved.length = 0;
    this.savedSet.clear();

    if (this.mixer) {
      if (!this.dead) this.mixer.update(dt);
    } else if (!this.dead) {
      this.proceduralIdle(t);
    }

    // Konuşma: kafa sallama
    const head = this.parts.get('head');
    if (this.talkT > 0 && head && !this.dead) {
      this.talkT -= dt;
      this.touch(head.bone);
      head.bone.quaternion.multiply(
        _q.setFromEuler(_e.set(Math.sin(t * 22) * 0.07, Math.sin(t * 9) * 0.1, Math.sin(t * 13) * 0.06)),
      );
    }

    // Vuruş yayları
    this.springs.forEach((s, b) => {
      s.vel.addScaledVector(s.ang, -170 * dt).multiplyScalar(Math.exp(-9 * dt));
      s.ang.addScaledVector(s.vel, dt);
      const a = s.ang.length();
      if (a > 1.3) s.ang.multiplyScalar(1.3 / a);
      if (a < 1e-3 && s.vel.lengthSq() < 1e-3) {
        this.springs.delete(b);
        return;
      }
      // Dünya uzayındaki dönüşü kemiğin yerel uzayına çevir.
      this.touch(b);
      const pq = b.parent!.getWorldQuaternion(_q2);
      _q.setFromAxisAngle(_v.copy(s.ang).normalize(), Math.min(a, 1.3));
      b.quaternion.premultiply(_q3.copy(pq).invert().multiply(_q).multiply(pq));
    });

    // Animasyon ölçek izleri kopmuş uzvu geri getirmesin.
    for (const b of this.severedBones) b.scale.setScalar(1e-4);

    for (const c of this.cauterized) {
      c.t += dt;
      c.mat.emissiveIntensity = 0.25 + 2.75 * Math.exp(-c.t * 0.8);
    }

    // Kök: geri savrulma + bacaksız kalınca çökme + nakavt
    this.knockVel.addScaledVector(this.knock, -60 * dt).multiplyScalar(Math.exp(-7 * dt));
    this.knock.addScaledVector(this.knockVel, dt);
    this.drop += (this.dropTarget - this.drop) * Math.min(1, dt * 10);
    let lift = 0;
    if (this.dead) {
      this.deadT += dt;
      const k = bounceOut(Math.min(this.deadT / 0.9, 1));
      this.root.rotation.x = -k * Math.PI * 0.5;
      lift = k * 0.22;
      this.knock.z -= dt * 0.6 * (1 - k);
    }
    this.root.position.set(this.knock.x, lift - this.drop, this.knock.z);
  }

  /** Animasyon klibi olmayan modeller için: nefes alma + ukala sallanma. */
  private proceduralIdle(t: number) {
    const set = (b: THREE.Bone | undefined | null, x: number, y: number, z: number) => {
      if (!b) return;
      b.quaternion.copy(this.rest.get(b)!).multiply(_q.setFromEuler(_e.set(x, y, z)));
    };
    const sp = this.rig.spine;
    sp.forEach((b, i) => set(b, Math.sin(t * 1.8) * 0.025, Math.sin(t * 0.9 + i) * 0.04, Math.sin(t * 1.1) * 0.02));
    set(this.rig.parts.head, Math.sin(t * 1.4) * 0.05, Math.sin(t * 0.7) * 0.18, Math.sin(t * 1.9) * 0.05);
    set(this.rig.parts.armL, 0, 0, Math.sin(t * 1.8) * 0.06);
    set(this.rig.parts.armR, 0, 0, -Math.sin(t * 1.8) * 0.06);
    set(this.rig.parts.forearmL, 0, Math.sin(t * 1.3) * 0.1, 0);
    set(this.rig.parts.forearmR, 0, -Math.sin(t * 1.3 + 1) * 0.1, 0);
  }

  dispose() {
    this.mixer?.stopAllAction();
    this.root.removeFromParent();
    for (const m of this.meshes) m.geometry.dispose();
  }
}

function bounceOut(x: number): number {
  const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
}
