import type { FaceLayout } from './character/face';
import type { PlaceholderLook } from './character/placeholder';
import type { PartId } from './character/rig';
import type { Lines } from './dialogue';
import asansorcu from './lines/asansorcu.json';
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
    /** Yüz maske / kask gibi katı bir şeyse: çene, göz, kaş hareketi uygulanmaz. */
    mask?: boolean;
    /**
     * Katı dönecek kafa hacmi (elipsoit; metre, 2.25 birim boya göre, kafa kemiğinden).
     * Boynuz, şapka gibi çıkıntıları olan modellerde otomatik tahminin yerine verilir.
     */
    head?: { center: [number, number, number]; radii: [number, number, number] };
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
    id: 'asansorcu',
    name: 'Asansörcü',
    slotName: 'Cehennem Katı',
    emoji: '🛗',
    maxWin: 15000,
    hp: 240,
    voice: { pitch: 0.7, rate: 1.0 },
    bloodColor: 0xc8102e,
    // Yüzü gaz maskesi: mimik uygulanmaz. Kafa hacmi boynuzları da kapsar (boynuzlar kafayla döner).
    model: { mask: true, head: { center: [0, 0.1, 0.03], radii: [0.3, 0.3, 0.26] } },
    look: { skin: 0xc96a5a, top: 0x7a1020, bottom: 0x1a1a1a, hair: 0x1a1a1a },
    symbols: ['🔥', '💀', '🛗', '⛓️', '🕯️', '🔔', 'A', 'K'],
    theme: { bg: '#3a0d0d', accent: '#ff5a2a' },
    lines: asansorcu,
  },
];
