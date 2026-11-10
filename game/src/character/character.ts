import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { CharacterDef } from '../characters';
import type { WeaponDef } from '../weapons';
import { BEHAVIORS, blendPose, newPose, resetPose, type Behavior, type LimbKey } from './acting';
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
const _q4 = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _rootInv = new THREE.Quaternion();
const _v2 = new THREE.Vector2();
const _v3 = new THREE.Vector3();

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
  private skin = new Map<THREE.SkinnedMesh, {
    idx: Uint16Array; w: Float32Array; dom: Uint16Array; index: Uint32Array;
    rest: Float32Array; pos: Float32Array; mats: Float32Array;
  }>();
  private time = Math.random() * 10;
  private talkT = 0;
  private knock = new THREE.Vector3();
  private knockVel = new THREE.Vector3();
  private drop = 0;
  private dropTarget = 0;
  private deadT = 0;
  private legLen = { thigh: 0.4, shin: 0.4 };
  private headOffset = 0.2;

  // Oyunculuk
  private limbs: { key: LimbKey; part: PartId; bone: THREE.Bone; dir: THREE.Vector3 }[] = [];
  private pose = newPose();
  private target = newPose();
  private behavior: Behavior = BEHAVIORS.smug;
  private behT = 0;
  private stand = new THREE.Vector2(); // sahnedeki (x, z) konumu
  private walkPhase = 0;
  private walkAmp = 0;
  private lookYaw = 0;
  private lookPitch = 0;
  behaviorName = 'smug';

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
    // Yön: rotationY verilmediyse iskeletten bul — sol kol +X'e gelecek şekilde çevir (yüz +Z'ye bakar).
    model.updateMatrixWorld(true);
    let yaw = cfg.rotationY;
    if (yaw === undefined) {
      const pre = detectRig(this.bones, cfg.boneMap).parts;
      const l = pre.armL ?? pre.legL, r = pre.armR ?? pre.legR;
      yaw = 0;
      if (l && r) {
        const v = l.getWorldPosition(new THREE.Vector3()).sub(r.getWorldPosition(new THREE.Vector3()));
        yaw = Math.atan2(v.z, v.x);
      }
    }
    model.rotation.y = yaw;
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

    // Kafa kemiği rig'e göre boyunda ya da yüzün ortasında olabilir: merkezi tepeye göre bul.
    const headBone = this.rig.parts.head;
    if (headBone) {
      const top = (cfg.height ?? 2.25) - headBone.getWorldPosition(new THREE.Vector3()).y;
      this.headOffset = THREE.MathUtils.clamp(top * 0.45, 0, 0.35);
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

    // Uzuv yönleri (kemik yerel uzayında): pozlar "şu uzuv şu yöne baksın" diye uygulanır.
    const limb = (key: LimbKey, part: PartId, childPart?: PartId) => {
      const bone = this.rig.parts[part];
      if (!bone) return;
      const child = (childPart && this.rig.parts[childPart]) || bone.children.find((c) => (c as THREE.Bone).isBone);
      if (!child) return;
      const dir = bone.worldToLocal(child.getWorldPosition(new THREE.Vector3())).normalize();
      this.limbs.push({ key, part, bone, dir });
    };
    limb('armL', 'armL', 'forearmL'); limb('foreL', 'forearmL');
    limb('armR', 'armR', 'forearmR'); limb('foreR', 'forearmR');
    limb('legL', 'legL', 'shinL'); limb('shinL', 'shinL');
    limb('legR', 'legR', 'shinR'); limb('shinR', 'shinR');

    for (const m of this.meshes) {
      m.computeBoundingSphere();
      m.boundingSphere!.radius *= 3; // savrulma + sahnede yürüme payı
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

  /**
   * Hızlı isabet testi. three'nin SkinnedMesh raycast'i her üçgen için köşeleri yeniden deriler;
   * burada köşeler bir kez derilip (düz dizilerde) ışın-üçgen testi yapılır. ~50 bin üçgenlik
   * modelde bile kılıç sürüklerken her karede çalışabilecek kadar ucuzdur.
   */
  raycast(ray: THREE.Ray): { point: THREE.Vector3; part: PartId | null } | null {
    const ox = ray.origin.x, oy = ray.origin.y, oz = ray.origin.z;
    const dx = ray.direction.x, dy = ray.direction.y, dz = ray.direction.z;
    let best = Infinity, bestMesh: THREE.SkinnedMesh | null = null, bestV = 0;

    for (const mesh of this.meshes) {
      const c = this.skinCache(mesh);
      const P = c.pos, I = c.index;
      for (let t = 0; t < I.length; t += 3) {
        const a = I[t] * 3, b = I[t + 1] * 3, cc = I[t + 2] * 3;
        const ax = P[a], ay = P[a + 1], az = P[a + 2];
        const e1x = P[b] - ax, e1y = P[b + 1] - ay, e1z = P[b + 2] - az;
        const e2x = P[cc] - ax, e2y = P[cc + 1] - ay, e2z = P[cc + 2] - az;
        // Möller–Trumbore
        const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x;
        const det = e1x * px + e1y * py + e1z * pz;
        if (det > -1e-10 && det < 1e-10) continue;
        const inv = 1 / det;
        const tx = ox - ax, ty = oy - ay, tz = oz - az;
        const u = (tx * px + ty * py + tz * pz) * inv;
        if (u < 0 || u > 1) continue;
        const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
        const v = (dx * qx + dy * qy + dz * qz) * inv;
        if (v < 0 || u + v > 1) continue;
        const d = (e2x * qx + e2y * qy + e2z * qz) * inv;
        if (d > 1e-4 && d < best) {
          best = d;
          bestMesh = mesh;
          bestV = I[t];
        }
      }
    }
    if (!bestMesh) return null;
    const bone = bestMesh.skeleton.bones[this.skin.get(bestMesh)!.dom[bestV]];
    const part = this.partOfBone.get(bone) ?? null;
    return {
      point: ray.at(best, new THREE.Vector3()),
      part: part && !this.parts.get(part)!.severed ? part : null,
    };
  }

  /** Mesh'in o anki pozdaki köşelerini dünya uzayında hesaplar. */
  private skinCache(mesh: THREE.SkinnedMesh) {
    let c = this.skin.get(mesh);
    const g = mesh.geometry;
    const n = g.attributes.position.count;
    if (!c) {
      const si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
      const idx = new Uint16Array(n * 4), w = new Float32Array(n * 4), dom = new Uint16Array(n);
      for (let i = 0; i < n; i++) {
        let bw = -1;
        for (let k = 0; k < 4; k++) {
          const j = si.getComponent(i, k), x = sw.getComponent(i, k);
          idx[i * 4 + k] = j;
          w[i * 4 + k] = x;
          if (x > bw) {
            bw = x;
            dom[i] = j;
          }
        }
      }
      const index = g.index ? Uint32Array.from(g.index.array) : Uint32Array.from({ length: n }, (_, i) => i);
      const rest = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        rest[i * 3] = g.attributes.position.getX(i);
        rest[i * 3 + 1] = g.attributes.position.getY(i);
        rest[i * 3 + 2] = g.attributes.position.getZ(i);
      }
      c = { idx, w, dom, index, rest, pos: new Float32Array(n * 3), mats: new Float32Array(mesh.skeleton.bones.length * 16) };
      this.skin.set(mesh, c);
    }

    // Kemik başına: mesh dünyası * bind⁻¹ * kemik matrisi * bind
    mesh.skeleton.update();
    const bm = mesh.skeleton.boneMatrices!;
    for (let j = 0; j < mesh.skeleton.bones.length; j++) {
      _m.fromArray(bm, j * 16).multiply(mesh.bindMatrix).premultiply(mesh.bindMatrixInverse).premultiply(mesh.matrixWorld);
      _m.toArray(c.mats, j * 16);
    }
    const { idx, w, rest, pos, mats } = c;
    for (let i = 0; i < n; i++) {
      const x = rest[i * 3], y = rest[i * 3 + 1], z = rest[i * 3 + 2];
      let rx = 0, ry = 0, rz = 0;
      for (let k = 0; k < 4; k++) {
        const wt = w[i * 4 + k];
        if (wt === 0) continue;
        const m = idx[i * 4 + k] * 16;
        rx += wt * (mats[m] * x + mats[m + 4] * y + mats[m + 8] * z + mats[m + 12]);
        ry += wt * (mats[m + 1] * x + mats[m + 5] * y + mats[m + 9] * z + mats[m + 13]);
        rz += wt * (mats[m + 2] * x + mats[m + 6] * y + mats[m + 10] * z + mats[m + 14]);
      }
      pos[i * 3] = rx;
      pos[i * 3 + 1] = ry;
      pos[i * 3 + 2] = rz;
    }
    return c;
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

    // Uzvun ekseni (eklemden dışarı): kesit bu eksene dik bir disk olur.
    const kid = bone.children.find((o) => (o as THREE.Bone).isBone);
    const axis = kid
      ? kid.getWorldPosition(new THREE.Vector3()).sub(joint)
      : joint.clone().sub(parent.getWorldPosition(new THREE.Vector3()));
    if (axis.lengthSq() < 1e-8) axis.set(0, 1, 0);
    axis.normalize();

    // Kesit yarıçapı: sınırdaki köşelerin eksene dik uzaklığı (alt çeyrek: pelerin, omuzluk gibi
    // uzağa yayılan parçalar yarıçapı şişirmesin). Sınır yoksa ekleme en yakın köşeler.
    let ring = boundary;
    if (ring.length < 6 && all.length) {
      ring = [...all].sort((a, b) => a.distanceToSquared(joint) - b.distanceToSquared(joint))
        .slice(0, Math.max(6, Math.floor(all.length * 0.08)));
    }
    let radius = 0.08;
    if (ring.length) {
      const ds = ring
        .map((p) => {
          const r = _v.copy(p).sub(joint);
          return r.addScaledVector(axis, -r.dot(axis)).length();
        })
        .sort((x, y) => x - y);
      radius = THREE.MathUtils.clamp(ds[Math.floor(ds.length * 0.2)], 0.04, 0.11);
    }

    const capMat = () => {
      const m = new THREE.MeshStandardMaterial(
        cauterize
          ? { color: 0x2a1408, emissive: 0xff5a10, emissiveIntensity: 3, roughness: 0.9 }
          : { color: new THREE.Color(this.def.bloodColor).multiplyScalar(0.28), roughness: 0.85 },
      );
      if (cauterize) this.cauterized.push({ mat: m, t: 0 });
      return m;
    };
    // Yassı disk: yerel Z ekseni uzuv eksenine çevrilir.
    const capGeo = new THREE.SphereGeometry(1, 14, 8).scale(1, 1, 0.3);
    const zAxis = new THREE.Vector3(0, 0, 1);

    // Güdük kapağı: ebeveyn kemiğe, kopan kemiğin yerine.
    const stump = new THREE.Mesh(capGeo, capMat());
    stump.position.copy(bone.position);
    stump.scale.setScalar(radius / parent.getWorldScale(_v).x);
    stump.quaternion
      .copy(parent.getWorldQuaternion(new THREE.Quaternion()).invert())
      .multiply(new THREE.Quaternion().setFromUnitVectors(zAxis, axis));
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
      cap.scale.setScalar(radius);
      cap.quaternion.setFromUnitVectors(zAxis, axis);
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

  /** Kafanın (yaklaşık) merkezi: kamera kadrajı ve altyazı için. */
  headPosition(out: THREE.Vector3): THREE.Vector3 {
    const head = this.parts.get('head');
    if (head && !head.severed) {
      head.bone.getWorldPosition(out);
      out.y += this.headOffset;
      return out;
    }
    return this.root.getWorldPosition(out).setY(this.root.position.y + 1.6);
  }

  private touch(b: THREE.Bone) {
    if (this.savedSet.has(b)) return;
    this.savedSet.add(b);
    this.saved.push([b, b.quaternion.clone()]);
  }

  /** Davranışı (sahneyi) değiştirir. */
  act(name: string) {
    const b = BEHAVIORS[name];
    if (!b || name === this.behaviorName) return;
    this.behavior = b;
    this.behaviorName = name;
    this.behT = 0;
  }

  get canWalk(): boolean {
    return !(['legL', 'legR', 'shinL', 'shinR'] as PartId[]).some((p) => this.parts.get(p)?.severed);
  }

  get lostArm(): boolean {
    return (['armL', 'armR', 'forearmL', 'forearmR'] as PartId[]).some((p) => this.parts.get(p)?.severed);
  }

  /** @param lookAt kafanın döneceği nokta (kamera): karakter seyirciyle göz teması kurar. */
  update(dt: number, lookAt?: THREE.Vector3) {
    this.time += dt;
    const t = this.time;

    // Geçen karede eklenen yay/konuşma ofsetlerini geri al.
    for (const [b, q] of this.saved) b.quaternion.copy(q);
    this.saved.length = 0;
    this.savedSet.clear();

    if (this.mixer && !this.dead) this.mixer.update(dt);

    // Kök: sahnede yürüme + geri savrulma + çökme + nakavt
    this.knockVel.addScaledVector(this.knock, -60 * dt).multiplyScalar(Math.exp(-7 * dt));
    this.knock.addScaledVector(this.knockVel, dt);
    this.drop += (this.dropTarget - this.drop) * Math.min(1, dt * 10);

    if (!this.dead) {
      this.behT += dt;
      resetPose(this.target);
      this.behavior(this.behT, this.target, {
        lostArmL: !!(this.parts.get('armL')?.severed || this.parts.get('forearmL')?.severed),
        lostArmR: !!(this.parts.get('armR')?.severed || this.parts.get('forearmR')?.severed),
      });
      if (!this.canWalk) this.target.x = this.target.z = 0;
      blendPose(this.pose, this.target, 1 - Math.exp(-7 * dt));

      // Hedefe kaymak yok: sınırlı hızla yürür, bacaklar hıza göre adım atar.
      const to = _v2.set(this.target.x, this.target.z).sub(this.stand);
      const dist = to.length();
      const step = Math.min(dist, 0.75 * dt);
      let speed = 0;
      if (dist > 1e-4) {
        this.stand.addScaledVector(to, step / dist);
        speed = step / Math.max(dt, 1e-4);
        // İleri mi geri mi yürüyor? (baktığı yöne göre)
        const fwd = Math.sin(this.pose.yaw) * to.x + Math.cos(this.pose.yaw) * to.y;
        this.walkPhase += (fwd >= 0 ? 1 : -1) * speed * 5.2 * dt;
      }
      this.walkAmp += (Math.min(1, speed / 0.5) - this.walkAmp) * Math.min(1, dt * 8);
    }

    let lift = 0;
    if (this.dead) {
      this.deadT += dt;
      const k = bounceOut(Math.min(this.deadT / 0.9, 1));
      this.root.rotation.x = -k * Math.PI * 0.5;
      lift = k * 0.22;
      this.knock.z -= dt * 0.6 * (1 - k);
    }
    const kneelDrop = this.pose.kneel * this.legLen.shin * 0.92;
    const bob = Math.abs(Math.sin(this.walkPhase)) * 0.03 * this.walkAmp;
    this.root.position.set(
      this.stand.x + this.knock.x,
      lift + bob - Math.max(this.drop, kneelDrop),
      this.stand.y + this.knock.z,
    );
    this.root.rotation.y = this.pose.yaw;

    if (!this.dead) this.applyPose(t, lookAt);

    // Konuşma: kafa sallama
    const head = this.parts.get('head');
    if (this.talkT > 0 && head && !this.dead) {
      this.talkT -= dt;
      this.touch(head.bone);
      head.bone.quaternion.multiply(
        _q.setFromEuler(_e.set(Math.sin(t * 22) * 0.06, Math.sin(t * 9) * 0.08, Math.sin(t * 13) * 0.05)),
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
  }

  /** Pozu iskelete uygular: gövde/kafa eğimi + uzuvları hedef yöne çevirme. */
  private applyPose(t: number, lookAt?: THREE.Vector3) {
    const p = this.pose;
    const rootQ = this.root.quaternion;
    const rootInv = _rootInv.copy(rootQ).invert();
    const breath = Math.sin(t * 1.6) * 0.02;
    const shake = p.tremble * 0.035;

    // Eğim: karakter uzayındaki dönüşü dünya üzerinden kemiğe taşı.
    const lean = (bone: THREE.Bone, x: number, y: number, z: number) => {
      const P = bone.parent!.getWorldQuaternion(_q2);
      _q.setFromEuler(_e.set(x, y, z));
      const Qw = _q3.copy(rootQ).multiply(_q).multiply(rootInv);
      const Wrest = _q4.copy(P).multiply(this.rest.get(bone)!);
      bone.quaternion.copy(P).invert().multiply(Qw).multiply(Wrest);
    };

    const sp = this.rig.spine;
    const n = Math.max(1, sp.length);
    sp.forEach((b, i) =>
      lean(
        b,
        (p.spine.x + breath) / n + Math.sin(t * 41 + i) * shake,
        p.spine.y / n,
        p.spine.z / n + Math.sin(t * 37 + i * 2) * shake,
      ),
    );

    const head = this.parts.get('head');
    if (head && !head.severed) {
      if (lookAt) {
        const d = _v.copy(lookAt).sub(head.bone.getWorldPosition(_v3)).applyQuaternion(rootInv);
        const yaw = THREE.MathUtils.clamp(Math.atan2(d.x, d.z), -1.15, 1.15);
        const pitch = THREE.MathUtils.clamp(-Math.atan2(d.y, Math.hypot(d.x, d.z)), -0.6, 0.6);
        this.lookYaw += (yaw - this.lookYaw) * 0.12;
        this.lookPitch += (pitch - this.lookPitch) * 0.12;
      }
      lean(
        head.bone,
        p.head.x + this.lookPitch * p.look - p.spine.x * 0.5 * p.look + Math.sin(t * 43) * shake,
        p.head.y + this.lookYaw * p.look - p.spine.y * p.look,
        p.head.z + Math.sin(t * 39) * shake,
      );
    }

    // Yürüme: bacak yönlerini adım döngüsüyle karıştır.
    const w = this.walkAmp * (1 - p.kneel);
    for (const l of this.limbs) {
      if (this.parts.get(l.part)!.severed) continue;
      const dir = _v.copy(p[l.key]);
      if (w > 0.01 && (l.key.startsWith('leg') || l.key.startsWith('shin'))) {
        const ph = this.walkPhase + (l.key.endsWith('R') ? Math.PI : 0);
        let a = 0.5 * Math.sin(ph);
        if (l.key.startsWith('shin')) a -= 0.75 * Math.max(0, Math.sin(ph + 1.9)); // diz kırma
        dir.lerp(_v3.set(dir.x, -Math.cos(a), Math.sin(a)), w);
      }
      const P = l.bone.parent!.getWorldQuaternion(_q2);
      const Wrest = _q4.copy(P).multiply(this.rest.get(l.bone)!);
      const cur = _v3.copy(l.dir).applyQuaternion(Wrest);
      const tgt = dir.normalize().applyQuaternion(rootQ);
      _q.setFromUnitVectors(cur, tgt);
      l.bone.quaternion.copy(P).invert().multiply(_q).multiply(Wrest);
    }
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
