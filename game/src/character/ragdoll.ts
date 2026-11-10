import * as THREE from 'three';

/**
 * Konum tabanlı (PBD / Verlet) ragdoll. Herhangi bir kemik ağacında çalışır:
 *  - `joints` içindeki her kemik bir parçacıktır; aradaki kemikler (omurga araları, köprücük,
 *    boyun, parmaklar) en yakın eklem atasına katı bağlı sayılır.
 *  - Kemik boyları mesafe kısıtıdır; çok çocuklu eklemlerde (kalça, göğüs) çocuklar birbirine de
 *    bağlanır ki gövde hacmini korusun. Katlanma sınırı eklemlerin tersine bükülüp içine
 *    geçmesini engeller.
 *  - Çözülen parçacık konumlarından kemik dönüşleri geri hesaplanır: tek çocuklu eklem çocuğuna
 *    doğru en kısa dönüşle çevrilir (burulma korunur), çok çocuklu eklem çocuklarının kurduğu
 *    üçgenden tam yönelim alır.
 *
 * Hem ölen bedeni hem kopan uzuvları bu sınıf canlandırır; ikisi de aynı fiziği paylaşır.
 */
interface Node {
  p: THREE.Vector3;
  prev: THREE.Vector3;
  r: number;
  /** Ters kütle: küçük = ağır. */
  w: number;
}

interface Link {
  a: number;
  b: number;
  len: number;
  k: number;
  /** Yalnızca itme: mesafe `len`'in altına düşmesin (katlanma sınırı). */
  minOnly?: boolean;
}

interface Solver {
  bone: THREE.Bone;
  node: number;
  kids: number[];
  /** Çocukların kemik yerel uzayındaki konumu. */
  rest: THREE.Vector3[];
  isRoot: boolean;
}

export interface RagdollOptions {
  /** Parçacık olarak benzetilecek kemikler (kök dahil). */
  joints: Set<THREE.Bone>;
  /** Kopmuş eklem: parçacık olur ama kemiği ve altı benzetilmez (güdüğün ucu). */
  cut?: (bone: THREE.Bone) => boolean;
  /** Çocuğu olmayan eklemlere yön verecek sanal uç (dünya konumu). Ör. kafanın tepesi. */
  tips?: Map<THREE.Bone, THREE.Vector3>;
  radius: (bone: THREE.Bone | null, isRoot: boolean) => number;
  invMass?: (bone: THREE.Bone | null, isRoot: boolean) => number;
  /** Zemin yüksekliği. */
  floor?: number;
}

const GRAVITY = 9.8;
const STEP = 1 / 90;
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _m1 = new THREE.Matrix4();
const _m2 = new THREE.Matrix4();

export class Ragdoll {
  readonly nodes: Node[] = [];
  private links: Link[] = [];
  private solvers: Solver[] = [];
  private acc = 0;
  private floor: number;
  /** Bu karede yere sert çarpan bir parçacık oldu mu (ses / sarsıntı için). */
  impact = 0;

  constructor(root: THREE.Bone, private opts: RagdollOptions) {
    this.floor = opts.floor ?? 0;
    root.updateWorldMatrix(true, true);
    this.build(root, -1, -1, true);
    this.brace();
  }

  private addNode(pos: THREE.Vector3, bone: THREE.Bone | null, isRoot: boolean): number {
    this.nodes.push({
      p: pos.clone(),
      prev: pos.clone(),
      r: this.opts.radius(bone, isRoot),
      w: this.opts.invMass?.(bone, isRoot) ?? 1,
    });
    return this.nodes.length - 1;
  }

  private link(a: number, b: number, k: number, minScale?: number) {
    const d = this.nodes[a].p.distanceTo(this.nodes[b].p);
    if (minScale !== undefined) this.links.push({ a, b, len: d * minScale, k, minOnly: true });
    else if (d > 1e-5) this.links.push({ a, b, len: d, k });
  }

  private build(bone: THREE.Bone, parent: number, grand: number, isRoot: boolean) {
    const node = this.addNode(bone.getWorldPosition(new THREE.Vector3()), bone, isRoot);
    if (parent >= 0) this.link(parent, node, 1);
    if (grand >= 0) this.link(grand, node, 1, 0.38);

    const solver: Solver = { bone, node, kids: [], rest: [], isRoot };
    this.solvers.push(solver);
    const addKid = (index: number, world: THREE.Vector3) => {
      solver.kids.push(index);
      solver.rest.push(bone.worldToLocal(world.clone()));
    };

    // En yakın eklem torunlarını bul: aradaki kemikler katı kabul edilir.
    const visit = (o: THREE.Object3D) => {
      for (const child of o.children) {
        const b = child as THREE.Bone;
        if (!b.isBone) continue;
        if (!this.opts.joints.has(b)) {
          visit(b);
          continue;
        }
        const world = b.getWorldPosition(new THREE.Vector3());
        if (this.opts.cut?.(b)) {
          const tip = this.addNode(world, null, false);
          this.link(node, tip, 1);
          addKid(tip, world);
        } else {
          addKid(this.nodes.length, world);
          this.build(b, node, parent, false);
        }
      }
    };
    visit(bone);

    const tip = this.opts.tips?.get(bone);
    if (tip && !solver.kids.length) {
      const t = this.addNode(tip, null, false);
      this.link(node, t, 1);
      addKid(t, tip);
    }

    // Çok çocuklu eklem: çocuklar birbirine bağlanır (kalça / göğüs üçgeni).
    for (let i = 0; i < solver.kids.length; i++) {
      for (let j = i + 1; j < solver.kids.length; j++) this.link(solver.kids[i], solver.kids[j], 1);
    }
  }

  /** Gövde çaprazları: iki çok çocuklu eklemin (kalça, göğüs) çocukları gevşekçe birbirine bağlanır. */
  private brace() {
    const hubs = this.solvers.filter((s) => s.kids.length >= 2);
    for (let i = 0; i < hubs.length; i++) {
      for (let j = i + 1; j < hubs.length; j++) {
        for (const a of hubs[i].kids) {
          for (const b of hubs[j].kids) {
            if (a !== hubs[j].node && b !== hubs[i].node && a !== b) this.link(a, b, 0.25);
          }
        }
      }
    }
  }

  /** Bütün parçacıklara hız ve (merkez etrafında) dönme verir. */
  launch(velocity: THREE.Vector3, spin?: THREE.Vector3) {
    const c = _a.set(0, 0, 0);
    for (const n of this.nodes) c.add(n.p);
    c.divideScalar(this.nodes.length);
    for (const n of this.nodes) {
      const v = _b.copy(velocity);
      if (spin) v.add(_c.copy(n.p).sub(c).cross(spin).negate());
      n.prev.copy(n.p).addScaledVector(v, -STEP);
    }
  }

  /** Bir noktanın çevresindeki parçacıkları iter (darbe). */
  impulse(point: THREE.Vector3, velocity: THREE.Vector3, reach = 0.6) {
    for (const n of this.nodes) {
      const f = Math.max(0, 1 - n.p.distanceTo(point) / reach);
      if (f > 0) n.prev.addScaledVector(velocity, -STEP * f);
    }
  }

  step(dt: number) {
    this.impact = 0;
    this.acc = Math.min(this.acc + dt, STEP * 5);
    while (this.acc >= STEP) {
      this.acc -= STEP;
      this.substep();
    }
  }

  private substep() {
    const g = GRAVITY * STEP * STEP;
    for (const n of this.nodes) {
      const vx = (n.p.x - n.prev.x) * 0.995, vy = (n.p.y - n.prev.y) * 0.995, vz = (n.p.z - n.prev.z) * 0.995;
      n.prev.copy(n.p);
      n.p.x += vx;
      n.p.y += vy - g;
      n.p.z += vz;
    }

    for (let it = 0; it < 6; it++) {
      for (const l of this.links) {
        const a = this.nodes[l.a], b = this.nodes[l.b];
        const d = _a.copy(b.p).sub(a.p);
        const dist = d.length();
        if (dist < 1e-7 || (l.minOnly && dist >= l.len)) continue;
        const corr = ((dist - l.len) / dist / (a.w + b.w)) * l.k;
        a.p.addScaledVector(d, corr * a.w);
        b.p.addScaledVector(d, -corr * b.w);
      }
      for (const n of this.nodes) {
        const min = this.floor + n.r;
        if (n.p.y >= min) continue;
        const speed = n.prev.y - n.p.y; // aşağı doğru hız (alt adım başına)
        n.p.y = min;
        // Sürtünme: yere değen parçacığın yatay hızı söner.
        n.prev.x += (n.p.x - n.prev.x) * 0.3;
        n.prev.z += (n.p.z - n.prev.z) * 0.3;
        if (it === 0) {
          if (speed > 0.012) this.impact = Math.max(this.impact, speed / STEP);
          // Hafif sekme. Önemli: zeminin altından başlayan parçacık (ör. diz çökmüş bedenden kopan
          // bacak) yukarı itilirken hız kazanmasın — Verlet'te konum düzeltmesi hızdır.
          n.prev.y = min - Math.min(Math.max(speed, 0) * 0.18, 0.02);
        }
      }
    }
  }

  /** Parçacıklardan kemiklere: konum (yalnız kök) ve yönelim. */
  apply() {
    for (const s of this.solvers) {
      const bone = s.bone;
      const parent = bone.parent!;
      parent.updateWorldMatrix(true, false);
      if (s.isRoot) {
        bone.position.copy(parent.worldToLocal(_a.copy(this.nodes[s.node].p)));
      }
      if (!s.kids.length) continue;
      bone.updateWorldMatrix(false, false);
      const parentQ = parent.getWorldQuaternion(_q2);

      if (s.kids.length === 1) {
        // Çocuğa doğru en kısa dönüş: burulma olduğu gibi kalır.
        const worldQ = bone.getWorldQuaternion(new THREE.Quaternion());
        const origin = _a.setFromMatrixPosition(bone.matrixWorld);
        const cur = _b.copy(s.rest[0]).normalize().applyQuaternion(worldQ);
        const tgt = _c.copy(this.nodes[s.kids[0]].p).sub(origin);
        if (tgt.lengthSq() < 1e-10) continue;
        _q.setFromUnitVectors(cur, tgt.normalize());
        bone.quaternion.copy(parentQ).invert().multiply(_q).multiply(worldQ);
      } else {
        // Üç noktadan tam yönelim: dinlenme üçgeni -> şimdiki üçgen.
        const three = s.kids.length >= 3;
        const o = this.nodes[s.node].p;
        const p0 = three ? this.nodes[s.kids[0]].p : o;
        const p1 = this.nodes[s.kids[three ? 1 : 0]].p;
        const p2 = this.nodes[s.kids[three ? 2 : 1]].p;
        const r0 = three ? s.rest[0] : _zero;
        const r1 = s.rest[three ? 1 : 0];
        const r2 = s.rest[three ? 2 : 1];
        if (!frame(_m1, r0, r1, r2) || !frame(_m2, p0, p1, p2)) continue;
        _q.setFromRotationMatrix(_m2.multiply(_m1.transpose()));
        bone.quaternion.copy(parentQ).invert().multiply(_q);
      }
    }
  }
}

const _zero = new THREE.Vector3();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();

/** Üç noktadan ortonormal çerçeve. Noktalar doğrusalsa false. */
function frame(out: THREE.Matrix4, a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3): boolean {
  _x.copy(b).sub(a);
  _y.copy(c).sub(a);
  _z.crossVectors(_x, _y);
  if (_z.lengthSq() < 1e-12) return false;
  _x.normalize();
  _z.normalize();
  _y.crossVectors(_z, _x);
  out.makeBasis(_x, _y, _z);
  return true;
}
