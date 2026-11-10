import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { CharacterDef } from '../characters';
import type { WeaponDef } from '../weapons';
import { BEHAVIORS, blendPose, newPose, resetPose, type Behavior, type LimbKey, type Pose } from './acting';
import { FaceRig, faceDepthMaterial, installFace, rigidHead, type FaceLayout, type Mood } from './face';
import { buildPlaceholder } from './placeholder';
import { Ragdoll } from './ragdoll';
import { detectRig, PART_CHILDREN, PART_IDS, type PartId, type Rig } from './rig';

const LIMB_HP = 30;
const HEAD_HP = 45; // kafa da kopar ama koparsa karakter ölür
const SEVER_BONUS = 10;

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
  /** Kopan parça: kendi iskeleti olan, eklemlerinden bükülen bir uzuv (dünya uzayında). */
  gib: THREE.Group | null;
  /** Parçanın fiziği. */
  ragdoll: Ragdoll | null;
  /** Parçanın kök kemiği (kesik ucu): kamera takibi ve kan izi için. */
  gibRoot: THREE.Object3D | null;
  joint: THREE.Vector3;
  radius: number;
  /** Güdükte kan damlatmak için: kesik noktasının bağlı olduğu kemik + yerel konum. */
  stumpParent: THREE.Object3D;
  stumpLocal: THREE.Vector3;
}

/** Bedenin duruşu: hangi bacakların kaldığına göre belirlenir. */
export type Posture = 'stand' | 'hop' | 'kneel' | 'sit';
type Side = 'L' | 'R';

export interface HitResult {
  damage: number;
  crit: boolean;
  zone: 'head' | 'body' | 'limb';
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
const _pole = new THREE.Vector3();
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
  private dropVel = 0;
  private ragdoll: Ragdoll | null = null;
  private hips: THREE.Bone | null = null;
  /** Asıl kafa kemiği. 'head' parçası boyundan kesilir; bakış ve yüz bu kemiğe göredir. */
  private headBone: THREE.Bone | null = null;
  private neck: THREE.Bone | null = null;
  private face: FaceRig | null = null;
  /** Model ölçeği (2.25 birim boya göre 1). */
  private unit = 1;
  private armLen = { upper: 0.3, fore: 0.3 };

  // Duruş ve yaralanma tepkileri
  posture: Posture = 'stand';
  private hopUntil = 0;
  private fallT = 9;
  private thud = false;
  private airborne = false;
  /** 1 -> 0: uzuv koptuktan sonraki şok. */
  private shock = 0;
  private shockT = 9;
  private woundSide = 0;
  private woundIsLeg = false;
  private woundBone: THREE.Bone | null = null;
  private clutch: { arm: Side; parent: THREE.Object3D; local: THREE.Vector3; until: number } | null = null;
  private ik: Record<Side, { w: number; want: number; target: THREE.Vector3 }> = {
    L: { w: 0, want: 0, target: new THREE.Vector3() },
    R: { w: 0, want: 0, target: new THREE.Vector3() },
  };
  private breath = 0;
  private flinch: { t: number; power: number; zone: 'head' | 'body' | 'arm' | 'leg'; side: number; point: THREE.Vector3 } | null = null;
  private faceYaw = 0;
  private ikDirs: Record<Side, { w: number; upper: THREE.Vector3; fore: THREE.Vector3 }> = {
    L: { w: 0, upper: new THREE.Vector3(), fore: new THREE.Vector3() },
    R: { w: 0, upper: new THREE.Vector3(), fore: new THREE.Vector3() },
  };
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
    const accept = (gltf: { scene: THREE.Object3D; animations: THREE.AnimationClip[] }) => {
      let hasSkin = false;
      gltf.scene.traverse((o) => {
        if ((o as THREE.SkinnedMesh).isSkinnedMesh) hasSkin = true;
      });
      if (!hasSkin) {
        console.warn(`[character] ${url} içinde rig (SkinnedMesh) yok; Tripo'da rigleyip öyle dışa aktarın. Geçici model kullanılıyor.`);
        return;
      }
      model = gltf.scene;
      clips = gltf.animations;
      c.usingPlaceholder = false;
    };
    try {
      accept(await new GLTFLoader().loadAsync(url));
    } catch {
      // .glb sunamayan barındırmalar için: aynı model base64 olarak JSON içinde (`<url>.json`, {"glb": "..."}).
      try {
        const packed = (await (await fetch(`${url}.json`)).json()) as { glb: string };
        const bytes = Uint8Array.from(atob(packed.glb), (ch) => ch.charCodeAt(0));
        accept(await new GLTFLoader().parseAsync(bytes.buffer, ''));
      } catch {
        // Model henüz eklenmemiş: geçici karakterle devam.
      }
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
    // Kafa boyundan kopar ve boyundan döner: kesim/eğim kemiği olarak boyun kullanılır.
    this.headBone = this.rig.parts.head ?? null;
    const above = this.headBone?.parent as THREE.Bone | undefined;
    if (above?.isBone && /neck/i.test(above.name)) {
      this.neck = above;
      this.rig.parts.head = above;
    }
    this.setupFace(model, cfg.height ?? 2.25);
    for (const id of PART_IDS) {
      const bone = this.rig.parts[id];
      if (bone) this.parts.set(id, { bone, hp: id === 'head' ? HEAD_HP : LIMB_HP, severed: false });
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
    const headBone = this.headBone;
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

    this.unit = (cfg.height ?? 2.25) / 2.25;
    this.hips = this.rig.hips;
    const armB = this.rig.parts.armL ?? this.rig.parts.armR, foreB = this.rig.parts.forearmL ?? this.rig.parts.forearmR;
    if (armB && foreB) {
      const wp = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3());
      const hand = foreB.children.find((c) => (c as THREE.Bone).isBone);
      this.armLen.upper = wp(armB).distanceTo(wp(foreB));
      this.armLen.fore = (hand ? wp(foreB).distanceTo(wp(hand)) : this.armLen.upper) + 0.07 * this.unit;
    }

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

  /**
   * Kafayı katılaştırır (yüz gerilmesin) ve yüz deformasyonunu malzemeye kurar.
   * Dinlenme pozunda, kök henüz orijindeyken çağrılır.
   */
  private setupFace(model: THREE.Object3D, height: number) {
    const hb = this.headBone;
    if (!hb) return;
    this.root.updateMatrixWorld(true);
    const H = 0.135 * height; // kafa boyu
    const hp = hb.getWorldPosition(new THREE.Vector3());
    const center = new THREE.Vector3(hp.x, height - 0.85 * H, hp.z + 0.13 * H);
    const radii = new THREE.Vector3(0.67 * H, 1.1 * H, 0.67 * H);
    const vol = this.def.model?.head;
    if (vol && !this.usingPlaceholder) {
      const u = height / 2.25;
      center.set(hp.x + vol.center[0] * u, hp.y + vol.center[1] * u, hp.z + vol.center[2] * u);
      radii.set(vol.radii[0] * u, vol.radii[1] * u, vol.radii[2] * u);
    }
    const masked = !!this.def.model?.mask && !this.usingPlaceholder;

    let layout: FaceLayout;
    const custom = this.def.model?.face;
    if (!this.usingPlaceholder && custom) {
      const u = height / 2.25;
      layout = { eyeX: custom.eyeX * u, eyeY: custom.eyeY * u, browY: custom.browY * u, mouthY: custom.mouthY * u, front: custom.front * u, size: custom.size * u };
    } else if (this.usingPlaceholder) {
      const k = model.scale.x; // geçici modelin yüzü kodla çizildi: ölçüleri belli
      layout = { eyeX: 0.12 * k, eyeY: 0.34 * k, browY: 0.44 * k, mouthY: 0.2 * k, front: 0.3 * k, size: 0.1 * k };
    } else {
      const eyeY = height - 0.62 * H - hp.y;
      layout = { eyeX: 0.28 * H, eyeY, browY: eyeY + 0.18 * H, mouthY: eyeY - 0.5 * H, front: 0.42 * H, size: 0.33 * H };
    }

    for (const mesh of this.meshes) {
      const headIndex = mesh.skeleton.bones.indexOf(hb);
      if (headIndex < 0) continue;
      if (!this.usingPlaceholder) {
        rigidHead(mesh, this.skinCache(mesh).pos, headIndex, center, radii);
        this.skin.delete(mesh); // ağırlıklar değişti: isabet önbelleği yeniden kurulsun
      }
      if (this.face) continue;
      // Mesh'in bağlama uzayı -> karakterin dinlenme uzayı (orijin: kafa kemiği).
      const faceMat = new THREE.Matrix4()
        .makeTranslation(-hp.x, -hp.y, -hp.z)
        .multiply(hb.matrixWorld)
        .multiply(mesh.skeleton.boneInverses[headIndex])
        .multiply(mesh.bindMatrix);
      this.face = new FaceRig(layout, faceMat, headIndex);
      if (masked) continue; // maske esnemez: yüz yalnızca konuşma vurgusu (kafa hareketi) için var
      for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) installFace(m, this.face.uniforms);
      mesh.customDepthMaterial = faceDepthMaterial(this.face.uniforms);
    }
  }

  /** Yüz ifadesi: perdeye göre kibirli / öfkeli / korkmuş. */
  setMood(mood: Mood) {
    if (!this.dead) this.face?.setMood(mood);
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

  /** @param h.power darbenin gücü: 1 normal, >1 ağır yumruk (hasar, savrulma ve tepki büyür) */
  hit(h: { point: THREE.Vector3; dir: THREE.Vector3; part: PartId | null; weapon: WeaponDef; power?: number }): HitResult {
    const res: HitResult = { damage: 0, crit: false, zone: 'body', severed: null, killed: false };
    if (this.dead) return res;
    const w = h.weapon;

    // Hasar bölgeye göre değişir: kafa çok can götürür, uzuvlar az. Oyuncunun derdi
    // karakteri öldürmeden sıkıştırmak olduğu için nereye vurduğu önemlidir.
    res.zone = h.part === 'head' ? 'head' : h.part ? 'limb' : 'body';
    res.crit = res.zone === 'head';
    const power = h.power ?? 1;
    res.damage = Math.max(1, Math.round(w.damage * power * (res.zone === 'head' ? 1.5 : res.zone === 'limb' ? 0.5 : 1)));

    this.face?.wince(res.zone === 'head' ? 1.2 : 0.8);

    // Tepki: vurulan kemik + ataları, kaldıraç koluna göre savrulur.
    const bone = h.part ? this.parts.get(h.part)!.bone : this.rig.spine[this.rig.spine.length - 1] ?? this.rig.hips;
    if (bone) this.impulse(bone, h.point, h.dir, w.force * power);
    this.knockVel.addScaledVector(h.dir, w.force * 0.17 * power);

    // Tepki pozu: nereden vurulduysa beden ona göre büzülür / savrulur.
    const local = _v.copy(h.point).sub(this.root.position).applyQuaternion(_q.copy(this.root.quaternion).invert());
    this.flinch = {
      t: 0, power: Math.min(1.6, 0.55 + w.force * 0.045 * power),
      zone: res.zone === 'limb' ? (h.part!.includes('arm') ? 'arm' : 'leg') : res.zone,
      side: local.x >= 0 ? 1 : -1, point: h.point.clone(),
    };

    // Uzuv koparma. Kafa da kopar — ama kafası kopan karakter ölür.
    if (h.part && w.sever > 0) {
      const st = this.parts.get(h.part)!;
      st.hp -= w.sever;
      if (st.hp <= 0) {
        res.severed = this.sever(h.part, !!w.cauterize);
        res.damage = h.part === 'head' ? this.hp : res.damage + SEVER_BONUS;
      }
    }

    res.damage = Math.min(res.damage, this.hp);
    this.hp -= res.damage;
    // Tek bacak üstünde sekerken darbe alırsa dengesini hemen kaybeder.
    if (this.posture === 'hop') this.hopUntil = Math.min(this.hopUntil, this.time + 0.12);
    if (this.hp <= 0) {
      this.dead = true;
      res.killed = true;
      this.collapse(h.point, h.dir, w.force);
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
   *  1) Kopan kemik alt ağacı klonlanır ve o alt ağaca ağırlıklı üçgenler, kendi iskeleti olan
   *     ayrı bir SkinnedMesh olur. Köşe verisi kopyalanmaz (aynı tamponlar, yeni indeks).
   *     Parça bir ragdoll'dur: dirsekten / dizden bükülür, yere gevşekçe serilir.
   *  2) Bedendeki kemik ~0'a ölçeklenir; uzuv ekleme doğru büzülüp kaybolur.
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

    // Uzvun ekseni (eklemden dışarı): kesit bu eksene dik bir disk olur.
    const kid = bone.children.find((o) => (o as THREE.Bone).isBone);
    const axis = kid
      ? kid.getWorldPosition(new THREE.Vector3()).sub(joint)
      : joint.clone().sub(parent.getWorldPosition(new THREE.Vector3()));
    if (axis.lengthSq() < 1e-8) axis.set(0, 1, 0);
    axis.normalize();

    // --- Kopan parçanın iskeleti: alt ağacın klonu + alt ağaç dışındaki kemikler için "hayalet"ler.
    // Hayaletler, kesik kenarındaki köşelerin (kısmen gövde kemiklerine bağlı) biçimini korur.
    const gib = new THREE.Group();
    const cloneRoot = bone.clone(true) as THREE.Bone;
    const cloneOf = new Map<THREE.Object3D, THREE.Object3D>();
    const pair = (a: THREE.Object3D, b: THREE.Object3D) => {
      cloneOf.set(a, b);
      a.children.forEach((c, i) => pair(c, b.children[i]));
    };
    pair(bone, cloneRoot);
    bone.matrixWorld.decompose(cloneRoot.position, cloneRoot.quaternion, cloneRoot.scale);
    gib.add(cloneRoot);
    cloneRoot.updateMatrixWorld(true);
    const rootInv = new THREE.Matrix4().copy(cloneRoot.matrixWorld).invert();
    // Zincir: kökten uca tek çocuklu yol (el / ayak ucunda biter). Hayaletlerden önce çıkarılır.
    const chain: THREE.Bone[] = [cloneRoot];
    for (;;) {
      const next = chain[chain.length - 1].children.filter((c) => (c as THREE.Bone).isBone && c.scale.x > 0.01);
      if (next.length !== 1) break;
      chain.push(next[0] as THREE.Bone);
    }
    const ghosts = new Map<THREE.Bone, THREE.Bone>();
    const ghost = (b: THREE.Bone) => {
      let g = ghosts.get(b);
      if (!g) {
        g = new THREE.Bone();
        _m.multiplyMatrices(rootInv, b.matrixWorld).decompose(g.position, g.quaternion, g.scale);
        cloneRoot.add(g);
        ghosts.set(b, g);
      }
      return g;
    };

    const boundary: THREE.Vector3[] = [];
    const all: THREE.Vector3[] = [];
    for (const mesh of this.meshes) {
      const c = this.skinCache(mesh); // o anki pozdaki dünya konumları (kesit ölçümü için)
      const at = (v: number) => new THREE.Vector3(c.pos[v * 3], c.pos[v * 3 + 1], c.pos[v * 3 + 2]);
      const inSub = new Int8Array(c.dom.length).fill(-1);
      const isIn = (v: number) => {
        if (inSub[v] < 0) inSub[v] = sub.has(mesh.skeleton.bones[c.dom[v]]) ? 1 : 0;
        return inSub[v] === 1;
      };
      const tris: number[] = [];
      for (let t = 0; t < c.index.length; t += 3) {
        const v0 = c.index[t], v1 = c.index[t + 1], v2 = c.index[t + 2];
        const i0 = isIn(v0), i1 = isIn(v1), i2 = isIn(v2);
        const n = +i0 + +i1 + +i2;
        if (n === 0) continue;
        if (n < 3) {
          if (i0) boundary.push(at(v0));
          if (i1) boundary.push(at(v1));
          if (i2) boundary.push(at(v2));
        }
        if (n < 2) continue;
        tris.push(v0, v1, v2);
        all.push(at(v0));
      }
      if (!tris.length) continue;
      const geo = new THREE.BufferGeometry();
      for (const name in mesh.geometry.attributes) geo.setAttribute(name, mesh.geometry.attributes[name]);
      geo.setIndex(tris);
      const piece = new THREE.SkinnedMesh(geo, mesh.material);
      piece.frustumCulled = false;
      piece.castShadow = true;
      if (mesh.customDepthMaterial) piece.customDepthMaterial = mesh.customDepthMaterial;
      const bones = mesh.skeleton.bones.map((b) => (cloneOf.get(b) as THREE.Bone | undefined) ?? ghost(b));
      piece.bind(new THREE.Skeleton(bones, mesh.skeleton.boneInverses.map((m) => m.clone())), mesh.bindMatrix);
      gib.add(piece);
    }

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
    const capQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis);
    const cap = (holder: THREE.Object3D, local: THREE.Vector3) => {
      const m = new THREE.Mesh(capGeo, capMat());
      m.position.copy(local);
      m.scale.setScalar(radius / holder.getWorldScale(_v).x);
      m.quaternion.copy(holder.getWorldQuaternion(new THREE.Quaternion()).invert()).multiply(capQ);
      holder.add(m);
    };
    cap(parent, bone.position); // güdük: ebeveyn kemiğe, kopan kemiğin yerine

    let ragdoll: Ragdoll | null = null;
    const hasGib = gib.children.length > 1;
    if (hasGib) {
      cap(cloneRoot, new THREE.Vector3());
      // Tek kemikli parça (kafa): eksen boyunca sanal bir uç verilir ki yuvarlanabilsin.
      const tips = new Map<THREE.Bone, THREE.Vector3>();
      const end = chain[chain.length - 1];
      if (chain.length === 1) tips.set(end, joint.clone().addScaledVector(axis, Math.max(0.22 * this.unit, radius * 2.4)));
      const r = Math.max(0.05, radius * (part === 'head' ? 1.4 : 0.9));
      ragdoll = new Ragdoll(cloneRoot, { joints: new Set(chain), tips, radius: () => r });
    }

    bone.scale.setScalar(1e-4);
    this.severedBones.push(bone);
    st.severed = true;
    const child = PART_CHILDREN[part];
    if (child && this.parts.has(child)) this.parts.get(child)!.severed = true;
    this.onSever(part, parent, bone);

    return {
      part, joint, radius, ragdoll,
      gib: hasGib ? gib : null,
      gibRoot: hasGib ? cloneRoot : null,
      stumpParent: parent,
      stumpLocal: bone.position.clone(),
    };
  }

  // ---------------------------------------------------------------- duruş ve yaralanma

  private legState(side: Side): 'full' | 'thigh' | 'none' {
    if (this.parts.get(`leg${side}`)?.severed) return 'none';
    return this.parts.get(`shin${side}`)?.severed ? 'thigh' : 'full';
  }

  private armOk(side: Side): boolean {
    return !this.parts.get(`arm${side}`)?.severed && !this.parts.get(`forearm${side}`)?.severed;
  }

  /** İki bacak da sağlam değilken bedenin yerdeki duruşu. */
  private downPosture(): Posture {
    return this.legState('L') !== 'none' && this.legState('R') !== 'none' ? 'kneel' : 'sit';
  }

  /** Bir uzuv koptuğunda: şok, yarayı tutma refleksi ve duruşun yeniden hesaplanması. */
  private onSever(part: PartId, stumpParent: THREE.Object3D, bone: THREE.Bone) {
    const side: Side = part.endsWith('L') ? 'L' : 'R';
    const isArm = part.includes('arm');
    this.shock = 1;
    this.shockT = 0;
    this.face?.wince(2.2); // uzun, sıkı bir acı ifadesi
    this.woundSide = part === 'head' ? 0 : side === 'L' ? 1 : -1;
    this.woundIsLeg = !isArm && part !== 'head';
    this.woundBone = (stumpParent as THREE.Bone).isBone ? (stumpParent as THREE.Bone) : null;

    // Sağlam el yaraya gider.
    const other: Side = side === 'L' ? 'R' : 'L';
    const hand: Side | null = isArm ? (this.armOk(other) ? other : null) : this.armOk(side) ? side : this.armOk(other) ? other : null;
    this.clutch = hand && part !== 'head'
      ? { arm: hand, parent: stumpParent, local: bone.position.clone(), until: this.time + (isArm ? 3.2 : 2.6) }
      : null;

    if (!isArm && part !== 'head') {
      const l = this.legState('L'), r = this.legState('R');
      if (this.posture === 'stand' && (l === 'full' || r === 'full')) {
        // Tek bacak kaldı: bir süre sekerek dengede durmaya çalışır, sonra yere iner.
        this.posture = 'hop';
        this.hopUntil = this.time + 1.3 + Math.random() * 1.1;
      } else {
        this.goDown();
      }
    }
  }

  private goDown() {
    const next = this.downPosture();
    if (next === this.posture) return;
    this.posture = next;
    this.fallT = 0;
    this.airborne = true;
  }

  /** Ölüm: beden kendini bırakır. Bundan sonra kemikleri fizik yönetir. */
  private collapse(point: THREE.Vector3, dir: THREE.Vector3, force: number) {
    const hips = this.hips;
    if (!hips) return;
    this.root.updateMatrixWorld(true);
    const u = this.unit;
    const joints = new Set<THREE.Bone>([hips]);
    const chest = this.rig.spine[this.rig.spine.length - 1];
    if (chest && chest !== hips) joints.add(chest);
    const tips = new Map<THREE.Bone, THREE.Vector3>();
    this.parts.forEach((st, id) => {
      joints.add(st.bone);
      // El ve ayak: ön kolun / baldırın ilk kemik çocuğu.
      if (id.startsWith('forearm') || id.startsWith('shin')) {
        const end = st.bone.children.find((c) => (c as THREE.Bone).isBone) as THREE.Bone | undefined;
        if (end) joints.add(end);
      }
    });
    const head = this.parts.get('head');
    if (head && !head.severed && this.headBone) {
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.headBone.getWorldQuaternion(new THREE.Quaternion()));
      tips.set(head.bone, this.headBone.getWorldPosition(new THREE.Vector3()).addScaledVector(up, this.headOffset * 2));
    }
    this.face?.setMood('dead');
    this.face?.silence();
    const severed = new Set(this.severedBones);
    const big = new Set<THREE.Bone | null>([hips, chest ?? null, head?.bone ?? null]);
    this.ragdoll = new Ragdoll(hips, {
      joints,
      tips,
      cut: (b) => severed.has(b),
      radius: (b, isRoot) => (isRoot ? 0.16 : b && big.has(b) ? 0.15 : 0.065) * u,
      invMass: (b, isRoot) => (isRoot ? 0.3 : b && big.has(b) ? 0.5 : 1),
    });
    // Başlangıç hızı: o anki savrulma + ölümcül darbenin itmesi.
    this.ragdoll.launch(_v.copy(this.knockVel).addScaledVector(dir, 0.6));
    this.ragdoll.impulse(point, _v3.copy(dir).multiplyScalar(1.5 + force * 0.22), 0.8 * u);
    this.springs.clear();
  }

  /** Bu karede beden yere çarptıysa true (bir kez). Ses ve sarsıntı için. */
  consumeThud(): boolean {
    const t = this.thud;
    this.thud = false;
    return t;
  }

  // ---------------------------------------------------------------- kare güncellemesi

  /** Bir repliği söyler: dudak hareketi + vurgulara göre kafa hareketi. */
  talk(text: string, seconds: number) {
    this.talkT = seconds;
    this.face?.speak(text, seconds);
  }

  /** Kafanın (yaklaşık) merkezi: kamera kadrajı ve altyazı için. */
  headPosition(out: THREE.Vector3): THREE.Vector3 {
    const head = this.parts.get('head');
    if (head && !head.severed && this.headBone) {
      this.headBone.getWorldPosition(out);
      out.y += this.headOffset;
      return out;
    }
    return this.bodyPosition(out).setY(out.y + 0.6 * this.unit);
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

  /** Ayakta ve iki bacağı üstünde mi (yürüyebilir mi). */
  get canWalk(): boolean {
    return this.posture === 'stand';
  }

  /** Bedenin merkezi (kalça): kamera takibi için. Ragdoll'da kök yerinde kalır, kalça hareket eder. */
  bodyPosition(out: THREE.Vector3): THREE.Vector3 {
    return this.hips ? this.hips.getWorldPosition(out) : this.root.getWorldPosition(out);
  }

  get lostArm(): boolean {
    return (['armL', 'armR', 'forearmL', 'forearmR'] as PartId[]).some((p) => this.parts.get(p)?.severed);
  }

  /**
   * @param lookAt kafanın döneceği nokta (kamera): karakter seyirciyle göz teması kurar.
   * @param voice çalan ses kaydının anlık genliği (dudak hareketi için)
   * @param faceTo gövdenin döneceği nokta: sahnede yürüyen oyuncu. Yoksa sahnenin önüne bakar.
   */
  update(dt: number, lookAt?: THREE.Vector3, voice = 0, faceTo?: THREE.Vector3 | null) {
    this.face?.update(dt, voice);
    this.time += dt;
    const t = this.time;

    // Ölü beden: kemikleri fizik yönetir.
    if (this.ragdoll) {
      this.ragdoll.step(dt);
      this.ragdoll.apply();
      if (this.ragdoll.impact > 1.6) this.thud = true;
      for (const b of this.severedBones) b.scale.setScalar(1e-4);
      this.fadeCauterized(dt);
      return;
    }

    // Geçen karede eklenen yay/konuşma ofsetlerini geri al.
    for (const [b, q] of this.saved) b.quaternion.copy(q);
    this.saved.length = 0;
    this.savedSet.clear();

    if (this.mixer) this.mixer.update(dt);

    // --- Durum: şok söner, tek bacakta sekme süresi dolunca beden yere iner.
    this.shock = Math.max(0, this.shock - dt / 3.2);
    this.shockT += dt;
    this.fallT += dt;
    if (this.posture === 'hop' && t > this.hopUntil) this.goDown();
    const weak = 1 - this.hp / this.maxHp;
    const stress = Math.max(this.shock, weak * 0.8);
    this.breath += dt * (1.6 + 2.4 * stress); // korku ve kan kaybı: hızlı, derin nefes

    // --- Oyunculuk hedefi + duruşun, yaranın ve güçsüzlüğün poza etkisi
    this.behT += dt;
    resetPose(this.target);
    this.behavior(this.behT, this.target, {
      lostArmL: !this.armOk('L'),
      lostArmR: !this.armOk('R'),
    });
    this.ik.L.want = this.ik.R.want = 0;
    this.compose(this.target, t, weak);
    blendPose(this.pose, this.target, 1 - Math.exp(-(7 - 3 * weak) * dt));

    // --- Kök: yer değiştirme. Ayaktayken yürür; yerdeyken ancak koluyla sürünebilir.
    this.knockVel.addScaledVector(this.knock, -60 * dt).multiplyScalar(Math.exp(-7 * dt));
    this.knock.addScaledVector(this.knockVel, dt);
    const grounded = this.posture === 'kneel' || this.posture === 'sit';
    const maxSpeed = this.posture === 'stand' ? 0.75 : grounded && (this.armOk('L') || this.armOk('R')) ? 0.2 : 0;
    // Oyuncu sahnede dolaşıyorsa gövde ona döner; sahne içi hedefler de onunla birlikte döner
    // (volta oyuncunun önünde atılır, geri çekilme oyuncudan uzağa olur).
    let want = 0;
    if (faceTo) want = Math.atan2(faceTo.x - this.root.position.x, faceTo.z - this.root.position.z);
    let dYaw = want - this.faceYaw;
    dYaw = Math.atan2(Math.sin(dYaw), Math.cos(dYaw));
    const turn = (this.posture === 'stand' ? 2.2 : 0.8) * dt;
    this.faceYaw += THREE.MathUtils.clamp(dYaw, -turn, turn);
    const cy = Math.cos(this.faceYaw), sy = Math.sin(this.faceYaw);
    const tx = THREE.MathUtils.clamp(this.target.x * cy + this.target.z * sy, -3.5, 3.5);
    const tz = THREE.MathUtils.clamp(-this.target.x * sy + this.target.z * cy, -2.2, 3.5);
    const to = _v2.set(tx, tz).sub(this.stand);
    const dist = to.length();
    const step = Math.min(dist, maxSpeed * dt);
    let speed = 0;
    if (dist > 1e-4 && step > 0) {
      this.stand.addScaledVector(to, step / dist);
      speed = step / Math.max(dt, 1e-4);
      // İleri mi geri mi? (baktığı yöne göre)
      const yawNow = this.pose.yaw + this.faceYaw;
      const fwd = Math.sin(yawNow) * to.x + Math.cos(yawNow) * to.y;
      this.walkPhase += (fwd >= 0 ? 1 : -1) * speed * (grounded ? 14 : 5.2) * dt;
    }
    this.walkAmp += (Math.min(1, speed / (grounded ? 0.15 : 0.5)) - this.walkAmp) * Math.min(1, dt * 8);
    // Sendeleme: darbeyle geri savrulurken ayakları da adım atar (kaymaz).
    const stagger = this.knockVel.length();
    if (this.posture === 'stand' && stagger > 0.25) {
      this.walkPhase -= stagger * 6 * dt;
      this.walkAmp = Math.max(this.walkAmp, Math.min(0.9, stagger / 1.4));
    }
    if (this.flinch && (this.flinch.t += dt) > 1.1) this.flinch = null;

    // --- Kök: yükseklik. Bacağını yitiren beden yere yay gibi değil, ağırlığıyla iner ve hafif seker.
    const knee = this.legLen.shin * 0.92;
    const seat = this.legLen.thigh + this.legLen.shin - 0.2 * this.unit;
    const postureDrop = this.posture === 'sit' ? seat : this.posture === 'kneel' ? knee : 0;
    const dropTarget = Math.max(postureDrop, this.pose.kneel * knee);
    this.dropVel += ((dropTarget - this.drop) * 110 - this.dropVel * 13) * dt;
    this.drop += this.dropVel * dt;
    if (this.airborne && dropTarget - this.drop < 0.04) {
      this.airborne = false;
      this.thud = true; // yere çarptı
      this.spineJolt(4);
    }
    const hop = this.posture === 'hop' ? Math.abs(Math.sin(t * 7.5)) * 0.07 * this.unit : 0;
    const bob = Math.abs(Math.sin(this.walkPhase)) * (grounded ? 0.025 : 0.03) * this.walkAmp;
    this.root.position.set(this.stand.x + this.knock.x, hop + bob - this.drop, this.stand.y + this.knock.z);
    this.root.rotation.y = this.pose.yaw + this.faceYaw;

    this.applyPose(t, dt, lookAt);

    // Konuşma: kafa, hecelerin vurgusuyla hafifçe öne iner ve ağır ağır salınır.
    const head = this.parts.get('head');
    if (this.talkT > 0 && head && !head.severed && this.headBone) {
      this.talkT -= dt;
      const j = this.face?.jaw ?? 0.3 + 0.3 * Math.sin(t * 11);
      this.touch(this.headBone);
      this.headBone.quaternion.multiply(
        _q.setFromEuler(_e.set(j * 0.09 - 0.02, Math.sin(t * 2.3) * 0.05, Math.sin(t * 1.7) * 0.035)),
      );
    }

    // Şoktayken güdük kendi kendine seğirir.
    if (this.woundBone && this.shock > 0.2 && Math.random() < 9 * dt) {
      this.spring(this.woundBone).vel.add(_v.randomDirection().multiplyScalar(5 * this.shock));
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
    this.fadeCauterized(dt);
  }

  private fadeCauterized(dt: number) {
    for (const c of this.cauterized) {
      c.t += dt;
      c.mat.emissiveIntensity = 0.25 + 2.75 * Math.exp(-c.t * 0.8);
    }
  }

  /** Yere çarpınca gövde öne doğru sarsılır. */
  private spineJolt(force: number) {
    const top = this.rig.spine[this.rig.spine.length - 1];
    if (top) this.spring(top).vel.add(_v.set(force, 0, 0).applyQuaternion(this.root.quaternion));
  }

  /**
   * Oyunculuk pozunun üstüne bedenin gerçek durumunu bindirir. Davranış "ne yapmak istediğini"
   * söyler; burası "bu bedenle ne yapabildiğini" belirler:
   *  - güçsüzlük: omuzlar düşer, baş öne eğilir
   *  - şok: önce irkilip başını geri atar, sonra yarasına bakar, yaralı tarafa büzülür, titrer
   *  - tek bacak: kollarını açıp sekerek denge arar
   *  - diz üstü / oturur: bacaklar yere göre dizilir, sağlam kol yere dayanır
   *  - yarayı tutma: sağlam el güdüğe gider (ters kinematik)
   */
  private compose(p: Pose, t: number, weak: number) {
    const okL = this.armOk('L'), okR = this.armOk('R');
    const floor = (side: number, x: number, z: number) =>
      _v.set(side * x, 0, z).multiplyScalar(this.unit).applyQuaternion(this.root.quaternion)
        .add(_v3.set(this.root.position.x, 0.05 * this.unit, this.root.position.z));
    const reach = (side: Side, target: THREE.Vector3) => {
      this.ik[side].want = 1;
      this.ik[side].target.copy(target);
    };

    p.spine.x += 0.22 * weak * weak;
    p.head.x += 0.15 * weak * weak;

    // Ağırlık aktarma: hiçbir poz kazık gibi durmaz; gövde ağır ağır salınır, baş dengeler.
    // Canı azaldıkça salınım sersemliğe döner.
    const sway = Math.sin(t * 0.55), dizzy = weak * weak;
    p.spine.z += sway * 0.035 + Math.sin(t * 1.7) * 0.11 * dizzy;
    p.spine.y += Math.sin(t * 0.4) * 0.04;
    p.head.z -= sway * 0.03 - Math.sin(t * 1.3) * 0.08 * dizzy;

    // Darbe tepkisi: ilk anda sert, sonra sönerek geçer.
    const fl = this.flinch;
    if (fl) {
      const f = fl.power * Math.exp(-fl.t * 6.5) * Math.min(1, fl.t * 40);
      const hold = fl.t > 0.12 && fl.t < 0.85; // acıyan yeri tutma süresi
      const hand: Side | null = fl.side > 0 ? (okR ? 'R' : okL ? 'L' : null) : okL ? 'L' : okR ? 'R' : null;
      if (fl.zone === 'head') {
        // Kafa geri savrulur, gövde geriye yaylanır, kollar açılır.
        p.spine.x -= 0.4 * f;
        p.spine.z -= fl.side * 0.22 * f;
        p.head.x -= 0.35 * f;
        p.look = Math.min(p.look, 1 - Math.min(1, f));
        p.armL.lerp(_v3.set(0.9, 0.1, -0.25), Math.min(0.75, f * 0.7));
        p.armR.lerp(_v3.set(-0.9, 0.1, -0.25), Math.min(0.75, f * 0.7));
      } else if (fl.zone === 'body') {
        // İki büklüm olur, eli karnına gider.
        p.spine.x += 0.7 * f;
        p.head.x += 0.25 * f;
        if (hold && hand) reach(hand, fl.point);
        if (this.posture === 'stand') p.kneel = Math.max(p.kneel, Math.min(0.25, 0.3 * f));
      } else if (fl.zone === 'arm') {
        // Vurulan omuz geri kaçar, öbür el oraya gider.
        p.spine.y += fl.side * 0.5 * f;
        p.spine.z += fl.side * 0.15 * f;
        const other: Side = fl.side > 0 ? 'R' : 'L';
        if (hold && this.armOk(other)) reach(other, fl.point);
      } else {
        // Dizi boşalır, o tarafa yığılır gibi olur.
        p.spine.x += 0.35 * f;
        p.spine.z += fl.side * 0.25 * f;
        if (this.posture === 'stand') p.kneel = Math.max(p.kneel, Math.min(0.5, 0.6 * f));
      }
    }

    if (this.shock > 0) {
      p.tremble = Math.max(p.tremble, this.shock);
      p.spine.z -= this.woundSide * 0.18 * this.shock; // yaralı tarafa büzül
      if (this.shockT < 0.45) {
        p.look = 0;
        p.head.x = -0.5;
        p.spine.x -= 0.2;
      } else if (this.shockT < 2.3) {
        p.look = 0;
        p.head.y = this.woundSide * (this.woundIsLeg ? 0.4 : 0.9);
        p.head.x = this.woundIsLeg ? 0.7 : 0.45;
        if (this.woundIsLeg) p.spine.x += 0.3;
      }
    }

    if (this.posture === 'hop') {
      const full: Side = this.legState('L') === 'full' ? 'L' : 'R';
      const sgn = full === 'L' ? 1 : -1;
      p.x = this.stand.x;
      p.z = this.stand.y;
      p.kneel = 0;
      // Kollar denge için açılır ve çırpınır.
      p.armL.set(0.95, 0.15 + 0.25 * Math.sin(t * 9), 0.1 * Math.sin(t * 7));
      p.foreL.set(0.9, 0.3 * Math.sin(t * 11), 0.3);
      p.armR.set(-0.95, 0.15 + 0.25 * Math.sin(t * 9 + 2), 0.1 * Math.sin(t * 7 + 1));
      p.foreR.set(-0.9, 0.3 * Math.sin(t * 11 + 2), 0.3);
      p.spine.z += 0.2 * Math.sin(t * 5) - sgn * 0.1; // ağırlık sağlam bacağın üstünde
      p.spine.x += 0.15;
      p.tremble = Math.max(p.tremble, 0.5);
      // Kalan bacak dik; kopan tarafın güdüğü havada sallanır.
      const lost = full === 'L' ? 'R' : 'L';
      p[`leg${full}`].set(-sgn * 0.08, -1, 0);
      p[`shin${full}`].set(0, -1, -0.12 - 0.1 * Math.abs(Math.sin(t * 7.5)));
      p[`leg${lost}`].set(-sgn * 0.15, -0.8, 0.55 * Math.sin(t * 6));
    } else if (this.posture === 'kneel') {
      p.kneel = 1;
      p.legL.set(0.1, -1, 0.15); p.legR.set(-0.1, -1, 0.15);
      p.shinL.set(0.02, -0.15, -1); p.shinR.set(-0.02, -0.15, -1);
    } else if (this.posture === 'sit') {
      p.kneel = 0;
      // Kalan bacak(lar) yerde öne uzanır.
      p.legL.set(0.2, -0.12, 1); p.legR.set(-0.2, -0.12, 1);
      p.shinL.set(0.06, -0.1, 1); p.shinR.set(-0.06, -0.1, 1);
      // Bir kol yere dayanır; iki kol da varsa sol dayanır, sağ konuşmaya devam eder.
      const brace: Side | null = okL ? 'L' : okR ? 'R' : null;
      if (brace) {
        const sgn = brace === 'L' ? 1 : -1;
        const drag = 0.22 * Math.sin(this.walkPhase) * this.walkAmp; // sürünürken uzan-çek
        reach(brace, floor(sgn, 0.44, -0.3 + drag));
        p.spine.x = p.spine.x * 0.5 - 0.2;
        p.spine.z -= sgn * 0.08;
      } else {
        p.spine.x += 0.45; // dayanacak kol yok: öne yığılır
        p.spine.z += 0.12 * Math.sin(t * 0.9);
      }
    }

    // Yere inerken iki el de düşüşü karşılamak için öne uzanır.
    if (this.fallT < 0.6 && this.posture !== 'hop' && this.posture !== 'stand') {
      const k = 1 - this.fallT / 0.6;
      if (okL) reach('L', floor(1, 0.3, 0.5));
      if (okR) reach('R', floor(-1, 0.3, 0.5));
      p.spine.x += 0.55 * k;
      p.look = Math.min(p.look, 1 - k);
    }

    // Yarayı tutma: düşüş bittikten sonra sağlam el güdüğe gider.
    const c = this.clutch;
    if (c && t < c.until && this.armOk(c.arm) && this.fallT > 0.6 && this.posture !== 'hop') {
      reach(c.arm, c.parent.localToWorld(_v.copy(c.local)));
    }
  }

  /** Pozu iskelete uygular: gövde/kafa eğimi, kol ters kinematiği, uzuvları hedef yöne çevirme. */
  private applyPose(t: number, dt: number, lookAt?: THREE.Vector3) {
    const p = this.pose;
    const rootQ = this.root.quaternion;
    const rootInv = _rootInv.copy(rootQ).invert();
    const stress = Math.max(this.shock, (1 - this.hp / this.maxHp) * 0.8);
    const breath = Math.sin(this.breath) * (0.02 + 0.035 * stress);
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
    const hb = this.headBone;
    if (head && !head.severed && hb) {
      if (lookAt) {
        const d = _v.copy(lookAt).sub(hb.getWorldPosition(_v3)).applyQuaternion(rootInv);
        const yaw = THREE.MathUtils.clamp(Math.atan2(d.x, d.z), -1.0, 1.0);
        const pitch = THREE.MathUtils.clamp(-Math.atan2(d.y, Math.hypot(d.x, d.z)), -0.5, 0.5);
        this.lookYaw += (yaw - this.lookYaw) * 0.12;
        this.lookPitch += (pitch - this.lookPitch) * 0.12;
      }
      const hx = p.head.x + this.lookPitch * p.look - p.spine.x * 0.5 * p.look + Math.sin(t * 43) * shake;
      const hy = p.head.y + this.lookYaw * p.look - p.spine.y * p.look;
      const hz = p.head.z + Math.sin(t * 39) * shake;
      // Dönüşün çoğu boyundan gelir (kafa boyun ekleminden döner), kalanı kafadan.
      const n = this.neck ? 0.7 : 0;
      if (this.neck) lean(this.neck, hx * n, hy * n, hz * n);
      lean(hb, hx * (1 - n), hy * (1 - n), hz * (1 - n));
    }

    // Kol ters kinematiği: el belirli bir noktaya (zemin, yara) gidecekse dirseği çöz.
    for (const side of ['L', 'R'] as const) {
      const ik = this.ik[side];
      ik.w += (ik.want - ik.w) * Math.min(1, dt * 9);
      const arm = this.rig.parts[`arm${side}`];
      if (ik.w < 0.01 || !arm || !this.armOk(side)) {
        this.ikDirs[side].w = 0;
        continue;
      }
      const sgn = side === 'L' ? 1 : -1;
      const shoulder = arm.getWorldPosition(_v3);
      const toT = _v.copy(ik.target).sub(shoulder);
      const L1 = this.armLen.upper, L2 = this.armLen.fore;
      const d = THREE.MathUtils.clamp(toT.length(), Math.abs(L1 - L2) + 1e-3, L1 + L2 - 1e-3);
      toT.normalize();
      const along = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
      const out = Math.sqrt(Math.max(0, L1 * L1 - along * along));
      // Dirsek dışa-aşağı-arkaya bakar.
      const pole = _pole.set(sgn * 0.6, -0.55, -0.55).applyQuaternion(rootQ);
      pole.addScaledVector(toT, -pole.dot(toT)).normalize();
      const o = this.ikDirs[side];
      o.upper.copy(toT).multiplyScalar(along).addScaledVector(pole, out); // omuz -> dirsek
      o.fore.copy(toT).multiplyScalar(d).sub(o.upper); // dirsek -> el
      o.upper.normalize().applyQuaternion(rootInv);
      o.fore.normalize().applyQuaternion(rootInv);
      o.w = ik.w;
    }

    // Uzuvlar: hedef yöne çevir. Yürürken bacak yönleri adım döngüsüyle karışır.
    const w = this.posture === 'stand' ? this.walkAmp * (1 - p.kneel) : 0;
    for (const l of this.limbs) {
      if (this.parts.get(l.part)!.severed) continue;
      const dir = _v.copy(p[l.key]).normalize();
      const leg = l.key.startsWith('leg'), shin = l.key.startsWith('shin');
      if (w > 0.01 && (leg || shin)) {
        const ph = this.walkPhase + (l.key.endsWith('R') ? Math.PI : 0);
        let a = 0.5 * Math.sin(ph);
        if (shin) a -= 0.75 * Math.max(0, Math.sin(ph + 1.9)); // diz kırma
        dir.lerp(_v3.set(dir.x, -Math.cos(a), Math.sin(a)), w);
      }
      if (!leg && !shin) {
        const ik = this.ikDirs[l.key.endsWith('L') ? 'L' : 'R'];
        if (ik.w > 0) dir.lerp(l.key.startsWith('arm') ? ik.upper : ik.fore, ik.w);
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
