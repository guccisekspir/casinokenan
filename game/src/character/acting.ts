import * as THREE from 'three';

/**
 * Oyunculuk katmanı. Pozlar kemik açılarıyla değil, **uzuvların karakter uzayındaki yönüyle**
 * tarif edilir (X = karakterin solu, Y = yukarı, Z = baktığı yön). Böylece aynı performans,
 * dinlenme pozu T ya da A olan her rig'de (Tripo dahil) aynı görünür.
 */
export interface Pose {
  armL: THREE.Vector3; foreL: THREE.Vector3;
  armR: THREE.Vector3; foreR: THREE.Vector3;
  legL: THREE.Vector3; shinL: THREE.Vector3;
  legR: THREE.Vector3; shinR: THREE.Vector3;
  /** Gövde ve kafa eğimi (radyan): x = öne eğil, y = sola dön, z = yana yat. */
  spine: THREE.Vector3;
  head: THREE.Vector3;
  /** Sahnedeki konum hedefi ve yön. Karakter oraya yürüyerek gider. */
  x: number; z: number; yaw: number;
  /** 0..1 diz çökme. */
  kneel: number;
  /** 0..1 kafanın kameraya (seyirciye) bakma ağırlığı. */
  look: number;
  /** 0..1 titreme. */
  tremble: number;
}

export type LimbKey = 'armL' | 'foreL' | 'armR' | 'foreR' | 'legL' | 'shinL' | 'legR' | 'shinR';
export const LIMB_KEYS: LimbKey[] = ['armL', 'foreL', 'armR', 'foreR', 'legL', 'shinL', 'legR', 'shinR'];

export interface ActCtx {
  lostArmL: boolean;
  lostArmR: boolean;
}
export type Behavior = (t: number, p: Pose, c: ActCtx) => void;

export function newPose(): Pose {
  const v = () => new THREE.Vector3();
  const p: Pose = {
    armL: v(), foreL: v(), armR: v(), foreR: v(), legL: v(), shinL: v(), legR: v(), shinR: v(),
    spine: v(), head: v(), x: 0, z: 0, yaw: 0, kneel: 0, look: 1, tremble: 0,
  };
  resetPose(p);
  return p;
}

export function resetPose(p: Pose) {
  p.armL.set(0.22, -1, 0.05); p.foreL.set(0.12, -1, 0.2);
  p.armR.set(-0.22, -1, 0.05); p.foreR.set(-0.12, -1, 0.2);
  p.legL.set(0.04, -1, 0); p.shinL.set(0.02, -1, -0.05);
  p.legR.set(-0.04, -1, 0); p.shinR.set(-0.02, -1, -0.05);
  p.spine.set(0, 0, 0); p.head.set(0, 0, 0);
  p.x = p.z = p.yaw = p.kneel = p.tremble = 0;
  p.look = 1;
}

export function blendPose(cur: Pose, tgt: Pose, k: number) {
  for (const key of LIMB_KEYS) cur[key].lerp(tgt[key], k);
  cur.spine.lerp(tgt.spine, k);
  cur.head.lerp(tgt.head, k);
  cur.kneel += (tgt.kneel - cur.kneel) * k;
  cur.look += (tgt.look - cur.look) * k;
  cur.tremble += (tgt.tremble - cur.tremble) * k;
  cur.yaw += (tgt.yaw - cur.yaw) * k * 0.6;
  // x / z: Character yürüme hızıyla ayrıca takip eder.
}

// --- yardımcılar: simetrik kol/bacak ---
const arms = (p: Pose, x: number, y: number, z: number) => { p.armL.set(x, y, z); p.armR.set(-x, y, z); };
const fores = (p: Pose, x: number, y: number, z: number) => { p.foreL.set(x, y, z); p.foreR.set(-x, y, z); };
const hipL = (p: Pose) => { p.armL.set(0.6, -0.75, -0.15); p.foreL.set(-0.75, -0.45, 0.5); };
const behindBack = (p: Pose) => { arms(p, 0.25, -0.9, -0.3); fores(p, -0.65, -0.5, -0.55); };
const kneel = (p: Pose) => {
  p.kneel = 1;
  p.legL.set(0.1, -1, 0.15); p.legR.set(-0.1, -1, 0.15);
  p.shinL.set(0.02, -0.15, -1); p.shinR.set(-0.02, -0.15, -1);
};
const sin = Math.sin;

/** Davranışlar: her biri zamana bağlı küçük bir sahne. */
export const BEHAVIORS: Record<string, Behavior> = {
  // ---------- I. Kibir ----------
  /** Eller belde, çene yukarıda. */
  smug: (t, p) => {
    arms(p, 0.6, -0.75, -0.15); fores(p, -0.75, -0.45, 0.5);
    p.spine.set(-0.1, 0.12 * sin(t * 0.5), 0);
    p.head.set(-0.18, 0, 0.08 * sin(t * 0.8));
  },
  /** "Ben ne yapayım?" omuz silkmesi. */
  shrug: (t, p) => {
    const k = 0.5 - 0.5 * Math.cos(t * 2.2);
    arms(p, 0.45, -0.9, 0.1); fores(p, 0.85, -0.2 + 0.5 * k, 0.45);
    p.spine.x = -0.05; p.head.z = 0.22;
  },
  /** Seyirciyi parmağıyla gösterip güler. */
  point: (t, p) => {
    hipL(p);
    p.armR.set(-0.15, -0.05, 1); p.foreR.set(-0.1, 0, 1);
    p.spine.x = 0.18 + 0.03 * sin(t * 14);
    p.head.x = 0.05 + 0.06 * sin(t * 14);
  },
  /** Ağır, alaycı alkış. */
  clap: (t, p) => {
    const s = Math.pow(0.5 + 0.5 * sin(t * 4.2), 3);
    arms(p, 0.35, -0.7, 0.6); fores(p, -0.25 - 0.42 * s, 0.45, 0.75);
    p.spine.x = -0.06; p.head.z = 0.15;
  },
  /** Sırtını döner, makaraları seyreder; arada omzunun üstünden bakar. */
  turnAway: (t, p) => {
    behindBack(p);
    p.yaw = Math.PI; p.z = -0.5; p.look = 0;
    p.head.y = t % 5 > 3.6 ? 1.15 : 0;
    p.spine.z = 0.04 * sin(t * 0.7);
  },
  /** Elleri arkada, canı sıkılmış bir hoca gibi volta atar. */
  pace: (t, p) => {
    behindBack(p);
    const s = sin(t * 0.42);
    p.x = 1.25 * s;
    p.yaw = Math.cos(t * 0.42) > 0 ? 1.25 : -1.25;
    p.look = 0.35; p.head.x = -0.1;
  },
  /** Tırnaklarına bakar: seninle ilgilenmiyor. */
  nails: (t, p) => {
    hipL(p);
    p.armR.set(-0.3, -0.55, 0.75); p.foreR.set(0.35, 0.9, 0.2 + 0.05 * sin(t * 3));
    p.look = 0; p.head.set(0.25, -0.35, 0.1);
    p.spine.z = -0.06;
  },

  /** Arkasındaki ekranı (çarpanı) gururla takdim eder. */
  present: (t, p) => {
    hipL(p);
    p.armR.set(-0.75, 0.35, -0.35); p.foreR.set(-0.6, 0.7, -0.4);
    p.spine.set(-0.08, -0.25, 0);
    // Önce ekrana bakar, sonra "gördün mü?" diye seyirciye döner.
    const toScreen = t % 3 < 1.1;
    p.look = toScreen ? 0 : 1;
    p.head.set(-0.15, toScreen ? -1.0 : 0, 0.1);
  },

  // ---------- II. Öfke ----------
  /** Parmak sallayarak azarlar. */
  scold: (t, p) => {
    hipL(p);
    p.armR.set(-0.3, -0.3, 0.9); p.foreR.set(-0.15 + 0.32 * sin(t * 9), 0.95, 0.25);
    p.spine.x = 0.15; p.head.x = 0.1;
  },
  /** Kollarını yüzüne siper eder. */
  guard: (t, p) => {
    arms(p, 0.3, -0.35, 0.85); fores(p, -0.3, 0.93, 0.15);
    p.spine.x = -0.12; p.head.x = 0.3; p.tremble = 0.5; p.z = -0.3;
    p.head.y = 0.2 * sin(t * 1.7);
  },
  /** Sersemlemiş, sallanır. */
  stagger: (t, p) => {
    arms(p, 0.35, -0.95, 0.15 * sin(t * 1.3)); fores(p, 0.2, -1, 0.3);
    p.spine.set(0.2 + 0.1 * sin(t * 2.1), 0, 0.25 * sin(t * 1.3));
    p.head.set(0.15, 0, -0.2 * sin(t * 1.3));
    p.x = 0.4 * sin(t * 0.9); p.look = 0.4;
  },
  /** Kopan kolunun yerine inanamayarak bakar. */
  lookStump: (t, p, c) => {
    const s = c.lostArmL ? 1 : -1; // kayıp taraf
    p.look = 0;
    p.head.set(0.45, 0.9 * s, 0);
    p.spine.set(0.1, 0.25 * s, 0);
    // Sağlam el, güdüğe uzanıp geri çekilir.
    const reach = 0.5 + 0.5 * sin(t * 1.5);
    const arm = s > 0 ? p.armR : p.armL, fore = s > 0 ? p.foreR : p.foreL;
    arm.set(0.25 * s, -0.5, 0.8); fore.set(0.9 * s * reach, 0.3, 0.5);
    p.tremble = 0.3;
  },

  // ---------- III. Yakarış ----------
  /** Diz çöker, ellerini kavuşturup yalvarır. */
  plead: (t, p) => {
    kneel(p);
    arms(p, 0.3, -0.6, 0.7); fores(p, -0.65, 0.6, 0.45);
    p.spine.x = 0.15 + 0.1 * sin(t * 3);
    p.head.x = -0.25; p.tremble = 0.6;
  },
  /** Büzülür, başını kollarıyla örter. */
  cower: (_t, p) => {
    kneel(p);
    arms(p, 0.4, 0.35, 0.8); fores(p, -0.6, 0.75, -0.25);
    p.spine.x = 0.75; p.head.x = 0.5; p.look = 0; p.tremble = 1; p.z = -0.6;
  },
  /** Bir eli "dur" der gibi önde, geri geri kaçar. */
  retreat: (t, p) => {
    p.armL.set(0.3, -0.35, 0.85); p.foreL.set(-0.3, 0.93, 0.15);
    p.armR.set(-0.2, 0.05, 1); p.foreR.set(-0.1, 0.55, 0.85);
    p.spine.x = -0.15; p.tremble = 0.7;
    p.z = -1.3; p.x = 0.5 * sin(t * 0.6);
  },
};

/** Ayakta olmayı gerektiren davranışlar: bacak kaybedince oynanmaz. ('retreat' yerde sürünerek de oynanır.) */
export const NEEDS_LEGS = new Set(['turnAway', 'pace', 'stagger']);
/** Seyirciye aldırmadığı davranışlar: vurulunca bozulur, karakter tepki verir. */
export const ALOOF = new Set(['turnAway', 'pace', 'nails']);
