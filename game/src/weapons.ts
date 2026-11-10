export type WeaponKind = 'blunt' | 'slash' | 'shot' | 'saw';

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
  /** Osmanlı tokadı: tek ve çok ağır bir vuruş; karakteri yere gömer. */
  slam?: boolean;
  /** Vuruş başına karakteri ne kadar sıkıştırdığı (çarpanı ne kadar yükselttiği). */
  fear: number;
  /** Art arda vuruşlar arası bekleme (sn). */
  cooldown: number;
  color?: number;
}

/**
 * Yeni silah eklemek için buraya bir satır + viewmodel.ts içine görseli eklemek yeterli.
 * Davranış `kind` üzerinden gelir: blunt = tıkla-vur, slash = sürükle-kes, shot = tıkla-ateş et,
 * saw = basılı tut, dişler değdiği sürece keser (değerler diş vuruşu başınadır).
 */
export const WEAPONS: WeaponDef[] = [
  { id: 'fist', name: 'Yumruk', icon: '👊', price: 0, kind: 'blunt', damage: 4, force: 7, sever: 0, fear: 1.9, cooldown: 0.12 },
  { id: 'knuckles', name: 'Muşta', icon: '🤜', price: 150, kind: 'blunt', damage: 8, force: 12, sever: 0, fear: 3.6, cooldown: 0.16 },
  { id: 'katana', name: 'Katana', icon: '🗡️', price: 600, kind: 'slash', damage: 12, force: 9, sever: 16, fear: 5, cooldown: 0.1 },
  { id: 'gun', name: 'Tabanca', icon: '🔫', price: 1500, kind: 'shot', damage: 10, force: 10, sever: 11, fear: 5, cooldown: 0.18 },
  { id: 'saber', name: 'Işın Kılıcı', icon: '⚡', price: 3000, kind: 'slash', damage: 20, force: 6, sever: 40, fear: 7, cauterize: true, cooldown: 0.1, color: 0x35e0ff },
  { id: 'saw', name: 'Testere', icon: '🪚', price: 2200, kind: 'saw', damage: 1, force: 2.5, sever: 5, fear: 1, cooldown: 0.08 },
  { id: 'slap', name: 'Osmanlı Tokadı', icon: '🖐️', price: 4000, kind: 'blunt', damage: 9, force: 26, sever: 0, fear: 14, cooldown: 2.2, slam: true },
];
