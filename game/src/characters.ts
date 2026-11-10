import type { FaceLayout } from './character/face';
import type { PlaceholderLook } from './character/placeholder';
import type { PartId } from './character/rig';
import type { Lines } from './dialogue';
import firavun from './lines/firavun-bey.json';
import prenses from './lines/seker-prenses.json';
import dede from './lines/simsek-dede.json';

export interface CharacterDef {
  id: string;
  name: string;
  /** Karakterin "ait olduğu" uydurma slot oyununun adı. */
  slotName: string;
  emoji: string;
  /** Yeterince sıkıştırılınca verdiği en büyük çarpan. */
  maxWin: number;
  /** Can. Sıfıra inerse ölür ve ödeme yapmaz: oyuncu kaybeder. */
  hp: number;
  /** Sesli okuma yedeği için (kayıt dosyası yoksa). */
  voice: { pitch: number; rate: number };
  /** Kan/sıvı rengi (prenses şeker şurubu akıtır vs.). */
  bloodColor: number;
  /**
   * Tripo modeli. Varsayılan yol: public/models/<id>.glb — dosya oradaysa otomatik yüklenir,
   * yoksa `look` ile üretilen geçici karakter kullanılır.
   */
  model?: {
    url?: string;
    /** Sahnedeki boy (birim). Varsayılan 2.25. */
    height?: number;
    /** Y ekseninde döndürme (radyan). Verilmezse yön iskeletten bulunur. */
    rotationY?: number;
    /** Kullanılacak bekleme animasyonunun adı (yoksa adı "idle" geçen ya da ilk klip). */
    idleClip?: string;
    /** false: GLB'deki animasyonları yok say. */
    useClips?: boolean;
    /**
     * Yüz ölçüleri (metre, 2.25 birim boya göre; kafa kemiğinin dinlenme konumundan).
     * Verilmezse kafa boyundan tahmin edilir; ifade yanlış yere oturuyorsa buradan ayarlanır.
     */
    face?: FaceLayout;
    /** Otomatik kemik eşleme tutmazsa: parça -> kemik adı. */
    boneMap?: Partial<Record<PartId, string>>;
  };
  look: PlaceholderLook;
  symbols: string[];
  theme: { bg: string; accent: string };
  /** Replikler: src/lines/<id>.json — olay -> alternatifler. */
  lines: Lines;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'simsek-dede',
    name: 'Şimşek Dede',
    slotName: 'Bulutların Kapısı',
    emoji: '⚡',
    maxWin: 5000,
    hp: 220,
    voice: { pitch: 0.5, rate: 1.05 },
    bloodColor: 0xc8102e,
    // Modelden ölçüldü: gözler kafa kemiğinin 3 cm üstünde, ağız 20 cm altında (bıyığın altı).
    model: { face: { eyeX: 0.085, eyeY: 0.03, browY: 0.085, mouthY: -0.2, front: 0.13, size: 0.1 } },
    look: { skin: 0xe2b08a, top: 0xf4f1e6, bottom: 0xd9b23a, hair: 0xf2f2f2, beard: 0xffffff, crown: 0xf2c230, skirt: true },
    symbols: ['⚡', '👑', '💍', '⏳', '🏺', '🔷', '🟣', '🟢'],
    theme: { bg: '#2a1a5e', accent: '#ffd23f' },
    lines: dede,
  },
  {
    id: 'seker-prenses',
    name: 'Şeker Prenses',
    slotName: 'Şeker Diyarı',
    emoji: '🍭',
    maxWin: 21000,
    hp: 260,
    voice: { pitch: 1.8, rate: 1.2 },
    bloodColor: 0xff5fb0,
    look: { skin: 0xffd9c4, top: 0xff7ac8, bottom: 0xb04ad8, hair: 0xffe066, crown: 0xffd23f, skirt: true },
    symbols: ['🍭', '🍬', '🍇', '🍉', '🍌', '💖', '⭐', '🍎'],
    theme: { bg: '#5e1a55', accent: '#ff8ad8' },
    lines: prenses,
  },
  {
    id: 'firavun-bey',
    name: 'Firavun Bey',
    slotName: 'Kayıp Mezarın Kitabı',
    emoji: '🏺',
    maxWin: 10000,
    hp: 300,
    voice: { pitch: 0.8, rate: 0.95 },
    bloodColor: 0xd9a441,
    look: { skin: 0xb9824f, top: 0x1f6fb5, bottom: 0xf4f1e6, hair: 0x1a1a1a, headdress: 0xe8b923, beard: 0x1a1a1a },
    symbols: ['📕', '🏺', '🐍', '👁️', '🦅', 'A', 'K', 'Q'],
    theme: { bg: '#4a3210', accent: '#e8b923' },
    lines: firavun,
  },
];
