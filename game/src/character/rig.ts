import * as THREE from 'three';

/**
 * Koparılabilir vücut parçaları. Her parça, iskeletteki bir "kesim kemiği"ne karşılık gelir:
 * o kemik ve altındaki her şey (ör. armL -> üst kol + ön kol + el) birlikte kopar.
 */
export type PartId =
  | 'head'
  | 'armL' | 'forearmL'
  | 'armR' | 'forearmR'
  | 'legL' | 'shinL'
  | 'legR' | 'shinR';

export const PART_IDS: PartId[] = [
  'head', 'armL', 'forearmL', 'armR', 'forearmR', 'legL', 'shinL', 'legR', 'shinR',
];

export const PART_LABEL: Record<PartId, string> = {
  head: 'KAFA',
  armL: 'KOL', forearmL: 'ÖN KOL',
  armR: 'KOL', forearmR: 'ÖN KOL',
  legL: 'BACAK', shinL: 'BALDIR',
  legR: 'BACAK', shinR: 'BALDIR',
};

/** Bir parça kopunca onunla birlikte giden alt parçalar. */
export const PART_CHILDREN: Partial<Record<PartId, PartId>> = {
  armL: 'forearmL', armR: 'forearmR', legL: 'shinL', legR: 'shinR',
};

export interface Rig {
  parts: Partial<Record<PartId, THREE.Bone>>;
  /** Gövde yalpalaması için omurga kemikleri (kökten uca). */
  spine: THREE.Bone[];
  hips: THREE.Bone | null;
}

type Kind = 'head' | 'arm' | 'forearm' | 'leg' | 'shin';

function sideOf(raw: string): 'L' | 'R' | null {
  const n = raw.replace(/mixamorig:?/i, '');
  if (/left/i.test(n) || /(^|[_.\-\s:])l($|[_.\-\s\d])/i.test(n) || /^L[A-Z]/.test(n) || /[a-z]L$/.test(n)) return 'L';
  if (/right/i.test(n) || /(^|[_.\-\s:])r($|[_.\-\s\d])/i.test(n) || /^R[A-Z]/.test(n) || /[a-z]R$/.test(n)) return 'R';
  return null;
}

function kindOf(raw: string): Kind | null {
  const n = raw.replace(/mixamorig:?/i, '').toLowerCase().replace(/[^a-z]/g, '');
  if (/twist|roll|ik|pole|end|top|helper|nub/.test(n)) return null;
  if (/head/.test(n)) return 'head';
  if (/forearm|lowerarm|lowarm|elbow/.test(n)) return 'forearm';
  if (/upperarm|uparm/.test(n) || (/arm/.test(n) && !/shoulder|clavicle|collar/.test(n))) return 'arm';
  if (/upleg|upperleg|thigh/.test(n)) return 'leg';
  if (/calf|shin|lowerleg|lowleg|knee/.test(n) || /leg/.test(n)) return 'shin';
  return null;
}

function depth(o: THREE.Object3D): number {
  let d = 0;
  for (let p = o.parent; p; p = p.parent) d++;
  return d;
}

/**
 * Kemik isimlerinden parça eşlemesini çıkarır. Mixamo ("mixamorig:LeftArm"),
 * Unreal ("upperarm_l"), Blender ("UpperArm.L") ve benzeri adlandırmaları tanır.
 * Tanınmayan bir rig için `override` ile kemik adı elle verilebilir.
 */
export function detectRig(bones: THREE.Bone[], override: Partial<Record<PartId, string>> = {}): Rig {
  const parts: Partial<Record<PartId, THREE.Bone>> = {};
  const set = (id: PartId, b: THREE.Bone) => {
    const cur = parts[id];
    if (!cur || depth(b) < depth(cur)) parts[id] = b; // aynı türden birden çok aday varsa köke en yakını
  };

  for (const b of bones) {
    const kind = kindOf(b.name);
    if (!kind) continue;
    if (kind === 'head') { set('head', b); continue; }
    const side = sideOf(b.name);
    if (!side) continue;
    set(`${kind}${side}` as PartId, b);
  }

  for (const id of PART_IDS) {
    const name = override[id];
    if (!name) continue;
    const b = bones.find((x) => x.name === name);
    if (b) parts[id] = b; else console.warn(`[rig] boneMap.${id}: "${name}" adında kemik yok`);
  }

  const missing = PART_IDS.filter((id) => !parts[id]);
  if (missing.length) {
    console.warn(
      `[rig] Şu parçalar için kemik bulunamadı: ${missing.join(', ')}. ` +
      `characters.ts içinde model.boneMap ile elle eşleyin. Kemikler:`,
      bones.map((b) => b.name),
    );
  }

  const spine = bones
    .filter((b) => /spine|chest|torso|waist/i.test(b.name) && !/twist|ik/i.test(b.name))
    .sort((a, b) => depth(a) - depth(b));
  const hips = bones.find((b) => /hip|pelvis|root/i.test(b.name)) ?? bones[0] ?? null;
  return { parts, spine, hips };
}
