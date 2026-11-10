import * as THREE from 'three';

export type WeaponKind = 'blunt' | 'slash' | 'shot';

export interface WeaponDef {
  id: string;
  name: string;
  icon: string;
  price: number;
  kind: WeaponKind;
  /** Karakterin canından düşen hasar. */
  damage: number;
  /** Vuruş tepkisinin (savrulma) şiddeti. */
  force: number;
  /** Uzvun "kopma canına" verilen hasar. 0 = bu silah uzuv koparamaz. */
  sever: number;
  /** Işın kılıcı gibi: kan yok, kesik yeri dağlanır. */
  cauterize?: boolean;
  /** Art arda vuruşlar arası bekleme (sn). */
  cooldown: number;
  color?: number;
}

/**
 * Yeni silah eklemek için buraya bir satır + buildViewModel içine bir görsel eklemek yeterli.
 * Davranış `kind` üzerinden gelir: blunt = tıkla-vur, slash = sürükle-kes, shot = tıkla-ateş et.
 */
export const WEAPONS: WeaponDef[] = [
  { id: 'fist', name: 'Yumruk', icon: '👊', price: 0, kind: 'blunt', damage: 4, force: 7, sever: 0, cooldown: 0.12 },
  { id: 'knuckles', name: 'Muşta', icon: '🤜', price: 150, kind: 'blunt', damage: 8, force: 12, sever: 0, cooldown: 0.16 },
  { id: 'katana', name: 'Katana', icon: '🗡️', price: 600, kind: 'slash', damage: 12, force: 9, sever: 16, cooldown: 0.1 },
  { id: 'gun', name: 'Tabanca', icon: '🔫', price: 1500, kind: 'shot', damage: 10, force: 10, sever: 11, cooldown: 0.18 },
  { id: 'saber', name: 'Işın Kılıcı', icon: '⚡', price: 3000, kind: 'slash', damage: 20, force: 6, sever: 40, cauterize: true, cooldown: 0.1, color: 0x35e0ff },
];

/** Birinci şahıs silah modeli. İleri yön +Z, tutma noktası orijin. */
export function buildViewModel(def: WeaponDef): THREE.Group {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xe0a47a, roughness: 0.7 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xd8dde6, roughness: 0.25, metalness: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1d1d24, roughness: 0.5, metalness: 0.4 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xf2c230, roughness: 0.3, metalness: 0.9 });

  const fist = () => {
    const f = new THREE.Group();
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.6, 4, 10).rotateX(Math.PI / 2), skin);
    arm.position.z = -0.42;
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.16, 0.17), skin);
    f.add(arm, hand);
    for (let i = 0; i < 4; i++) {
      const k = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), skin);
      k.position.set(-0.066 + i * 0.044, 0.045, 0.085);
      f.add(k);
    }
    return f;
  };

  switch (def.id) {
    case 'fist':
      g.add(fist());
      break;
    case 'knuckles': {
      g.add(fist());
      for (let i = 0; i < 4; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.014, 8, 12), gold);
        ring.position.set(-0.066 + i * 0.044, 0.02, 0.1);
        g.add(ring);
      }
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.035, 0.04), gold);
      bar.position.set(0, -0.02, 0.1);
      g.add(bar);
      break;
    }
    case 'gun': {
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.36), dark);
      slide.position.set(0, 0.06, 0.1);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.2, 0.08), dark);
      grip.position.set(0, -0.05, -0.02);
      grip.rotation.x = 0.2;
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.13, 0.13), skin);
      hand.position.set(0, -0.07, -0.02);
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.5, 4, 10).rotateX(Math.PI / 2), skin);
      arm.position.set(0, -0.09, -0.36);
      const flash = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0xffd060, transparent: true, opacity: 0.9 }),
      );
      flash.name = 'flash';
      flash.position.set(0, 0.06, 0.34);
      flash.visible = false;
      g.add(slide, grip, hand, arm, flash);
      break;
    }
    default: {
      // Kesici silahlar: katana / ışın kılıcı
      const isSaber = !!def.cauterize;
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.14), skin);
      const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.3, 10).rotateX(Math.PI / 2), isSaber ? steel : dark);
      hilt.position.z = 0.05;
      g.add(hand, hilt);
      if (isSaber) {
        const mat = new THREE.MeshBasicMaterial({ color: def.color ?? 0x35e0ff });
        const blade = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 1.0, 4, 10).rotateX(Math.PI / 2), mat);
        blade.position.z = 0.75;
        const glow = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.05, 1.0, 4, 10).rotateX(Math.PI / 2),
          new THREE.MeshBasicMaterial({ color: def.color ?? 0x35e0ff, transparent: true, opacity: 0.25, depthWrite: false }),
        );
        glow.position.z = 0.75;
        const light = new THREE.PointLight(def.color ?? 0x35e0ff, 6, 4);
        light.position.z = 0.7;
        g.add(blade, glow, light);
      } else {
        const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 12).rotateX(Math.PI / 2), gold);
        guard.position.z = 0.2;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.05, 1.05), steel);
        blade.position.z = 0.73;
        g.add(guard, blade);
      }
    }
  }
  g.traverse((o) => {
    o.frustumCulled = false;
  });
  return g;
}
