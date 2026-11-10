import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Tripo modeli gelene kadar kullanılan geçici karakter.
 * Bilerek GERÇEK bir iskelet + tek parça SkinnedMesh üretir; böylece vuruş tepkisi,
 * isabet tespiti ve uzuv koparma, Tripo'dan gelen rig'li GLB ile birebir aynı koddan geçer.
 */
export interface PlaceholderLook {
  skin: number;
  top: number;
  bottom: number;
  hair: number;
  beard?: number;
  crown?: number;
  headdress?: number;
  skirt?: boolean;
}

type V3 = [number, number, number];

// Bind pozu (T-poz) eklem konumları. Karakter +Z'ye bakar, sol tarafı +X.
const JOINTS: Record<string, [string | null, V3]> = {
  Hips: [null, [0, 0.95, 0]],
  Spine: ['Hips', [0, 1.08, 0]],
  Chest: ['Spine', [0, 1.26, 0]],
  Neck: ['Chest', [0, 1.5, 0]],
  Head: ['Neck', [0, 1.58, 0]],
};
for (const [side, s] of [['Left', 1], ['Right', -1]] as const) {
  JOINTS[`${side}Shoulder`] = ['Chest', [0.12 * s, 1.45, 0]];
  JOINTS[`${side}Arm`] = [`${side}Shoulder`, [0.3 * s, 1.45, 0]];
  JOINTS[`${side}ForeArm`] = [`${side}Arm`, [0.58 * s, 1.45, 0]];
  JOINTS[`${side}Hand`] = [`${side}ForeArm`, [0.84 * s, 1.45, 0]];
  JOINTS[`${side}UpLeg`] = ['Hips', [0.14 * s, 0.9, 0]];
  JOINTS[`${side}Leg`] = [`${side}UpLeg`, [0.14 * s, 0.5, 0]];
  JOINTS[`${side}Foot`] = [`${side}Leg`, [0.14 * s, 0.1, 0]];
}

export function buildPlaceholder(look: PlaceholderLook): THREE.SkinnedMesh {
  const names = Object.keys(JOINTS);
  const bones = names.map((n) => {
    const b = new THREE.Bone();
    b.name = n;
    return b;
  });
  names.forEach((n, i) => {
    const [parent, p] = JOINTS[n];
    if (parent) {
      const pp = JOINTS[parent][1];
      bones[i].position.set(p[0] - pp[0], p[1] - pp[1], p[2] - pp[2]);
      bones[names.indexOf(parent)].add(bones[i]);
    } else bones[i].position.set(...p);
  });

  const geos: THREE.BufferGeometry[] = [];
  const add = (g: THREE.BufferGeometry, bone: string, color: number) => {
    const n = g.attributes.position.count;
    const c = new THREE.Color(color);
    const col = new Float32Array(n * 3);
    const si = new Uint16Array(n * 4);
    const sw = new Float32Array(n * 4);
    const bi = names.indexOf(bone);
    for (let i = 0; i < n; i++) {
      col.set([c.r, c.g, c.b], i * 3);
      si[i * 4] = bi;
      sw[i * 4] = 1;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4));
    g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
    geos.push(g);
  };
  const up = new THREE.Vector3(0, 1, 0);
  const capsule = (a: V3, b: V3, r: number) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const d = vb.clone().sub(va);
    const g = new THREE.CapsuleGeometry(r, d.length(), 4, 12);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, d.clone().normalize()));
    const m = va.add(vb).multiplyScalar(0.5);
    return g.translate(m.x, m.y, m.z);
  };
  const sphere = (p: V3, r: number, s: V3 = [1, 1, 1]) =>
    new THREE.SphereGeometry(r, 20, 14).scale(...s).translate(...p);
  const box = (p: V3, s: V3) => new THREE.BoxGeometry(...s).translate(...p);

  // Gövde
  add(sphere([0, 0.95, 0], 0.25, [1, 0.72, 0.8]), 'Hips', look.bottom);
  add(capsule([0, 1.02, 0], [0, 1.2, 0], 0.22), 'Spine', look.top);
  add(sphere([0, 1.36, 0], 0.27, [1.15, 0.8, 0.8]), 'Chest', look.top);
  add(capsule([0, 1.48, 0], [0, 1.6, 0], 0.07), 'Neck', look.skin);
  if (look.skirt) {
    add(new THREE.CylinderGeometry(0.24, 0.46, 0.5, 20).translate(0, 0.78, 0), 'Hips', look.top);
  }

  // Kafa (maskot havası için iri)
  const hy = 1.88;
  add(sphere([0, hy, 0], 0.34), 'Head', look.skin);
  add(
    new THREE.SphereGeometry(0.365, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5)
      .rotateX(-0.25).translate(0, hy + 0.01, -0.01),
    'Head', look.hair,
  );
  for (const s of [1, -1]) {
    add(sphere([0.12 * s, hy + 0.04, 0.3], 0.05), 'Head', 0xffffff);
    add(sphere([0.125 * s, hy + 0.035, 0.335], 0.026), 'Head', 0x111111);
    // Ukala kaş
    add(box([0, 0, 0], [0.13, 0.03, 0.03]).rotateZ(0.35 * s).translate(0.12 * s, hy + 0.13, 0.31), 'Head', look.hair);
  }
  add(sphere([0, hy - 0.03, 0.34], 0.045), 'Head', look.skin);
  // Sırıtış
  add(new THREE.TorusGeometry(0.1, 0.018, 8, 16, Math.PI).rotateZ(Math.PI).translate(0, hy - 0.1, 0.3), 'Head', 0x7a1020);
  if (look.beard !== undefined) {
    add(new THREE.ConeGeometry(0.22, 0.42, 16).rotateX(Math.PI).translate(0, hy - 0.33, 0.17), 'Head', look.beard);
  }
  if (look.crown !== undefined) {
    add(new THREE.CylinderGeometry(0.2, 0.16, 0.14, 8).translate(0, hy + 0.36, 0), 'Head', look.crown);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      add(new THREE.ConeGeometry(0.04, 0.1, 6).translate(Math.cos(a) * 0.19, hy + 0.47, Math.sin(a) * 0.19), 'Head', look.crown);
    }
  }
  if (look.headdress !== undefined) {
    add(box([0, hy + 0.12, -0.08], [0.8, 0.5, 0.5]), 'Head', look.headdress);
    for (const s of [1, -1]) add(box([0.3 * s, hy - 0.28, 0.02], [0.16, 0.5, 0.2]), 'Head', look.headdress);
  }

  // Kollar ve bacaklar
  for (const [side, s] of [['Left', 1], ['Right', -1]] as const) {
    add(capsule([0.3 * s, 1.45, 0], [0.55 * s, 1.45, 0], 0.078), `${side}Arm`, look.top);
    add(capsule([0.6 * s, 1.45, 0], [0.81 * s, 1.45, 0], 0.066), `${side}ForeArm`, look.skin);
    add(sphere([0.9 * s, 1.45, 0], 0.09), `${side}Hand`, look.skin);
    add(capsule([0.14 * s, 0.86, 0], [0.14 * s, 0.55, 0], 0.1), `${side}UpLeg`, look.bottom);
    add(capsule([0.14 * s, 0.46, 0], [0.14 * s, 0.17, 0], 0.085), `${side}Leg`, look.skin);
    add(box([0.14 * s, 0.05, 0.06], [0.17, 0.1, 0.32]), `${side}Foot`, 0x2a2230);
  }

  const geo = mergeGeometries(geos)!;
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.65, metalness: 0.05 });
  const mesh = new THREE.SkinnedMesh(geo, mat);
  mesh.name = 'placeholder';
  mesh.add(bones[0]);
  mesh.bind(new THREE.Skeleton(bones));

  // Dinlenme pozu: kollar aşağı.
  bones[names.indexOf('LeftArm')].rotation.z = -1.2;
  bones[names.indexOf('RightArm')].rotation.z = 1.2;
  bones[names.indexOf('LeftForeArm')].rotation.y = -0.25;
  bones[names.indexOf('RightForeArm')].rotation.y = 0.25;
  return mesh;
}
