import type { FaceLayout } from './character/face';
import type { PlaceholderLook } from './character/placeholder';
import type { PartId } from './character/rig';
import type { Lines } from './dialogue';
import asansorcu from './lines/asansorcu.json';
import balikci from './lines/balikci.json';
import demirci from './lines/demirci.json';
import haydut from './lines/haydut.json';
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
  /**
   * "Verecekmiş gibi yapan" maskot: max win baştan beri ekrandadır ama parmaklık arkasında.
   * Oyuncu tam alacakken `blocks` kez set çeker (baskı geri düşer); ancak ondan sonra verir.
   */
  tease?: { blocks: number };
  /**
   * Eksik ödeyen maskot: ekrana yazdığı çarpanın yalnızca `pay` kadarını öder (0.05 = yirmide biri).
   * Max win'i ise tam öder.
   */
  lowball?: { pay: number };
  /**
   * Makarada vaat edilen özel sembol (ör. "VS"). Dönerken beş sütunda da görünür, durunca üç
   * tane kalır ve hiçbiri aynı hatta olmaz.
   */
  reelBadge?: string;
  /** İkinci perdeye geçecek gibi yapıp geri dönen maskot: `times` kez oyalar, sonra geçer. */
  stall?: { times: number };
  /** Son perdede alıp çıkana hiçbir şey ödemez (0x). Max win'i yine öder. */
  noPayFinal?: boolean;
  /**
   * Makara düzeni. 'fish': ya göl değerli balıklarla doludur ve balıkçı yoktur, ya da balıkçı
   * gelmiştir ama ortada tek bir 2x'lik balık vardır.
   */
  reelMode?: 'fish';
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
  {
    id: 'demirci',
    name: 'Demirci',
    slotName: 'Yolcunun Ocağı',
    emoji: '⚒️',
    maxWin: 25000,
    hp: 280,
    voice: { pitch: 0.6, rate: 0.95 },
    bloodColor: 0xc8102e,
    // Max win'i baştan beri ekranda gösterir ama parmaklık arkasında tutar; tam alınacakken iki kez set çeker.
    tease: { blocks: 2 },
    model: {
      face: { eyeX: 0.085, eyeY: 0.115, browY: 0.165, mouthY: -0.11, front: 0.2, size: 0.085 },
      head: { center: [0, 0.1, 0.05], radii: [0.3, 0.34, 0.28] }, // miğfer ve boynuzlar kafayla döner
    },
    look: { skin: 0xc98a5a, top: 0x5a3a20, bottom: 0x2a2a2a, hair: 0x3a2a1a, beard: 0x3a2a1a },
    symbols: ['⚒️', '🔥', '🛡️', '⚔️', '🪙', '⛓️', 'A', 'K'],
    theme: { bg: '#2a1a0d', accent: '#ff9a2a' },
    lines: demirci,
  },
  {
    id: 'haydut',
    name: 'Haydut',
    slotName: 'Düello Kasabası',
    emoji: '🤠',
    maxWin: 12500,
    hp: 230,
    voice: { pitch: 0.75, rate: 0.9 },
    bloodColor: 0xc8102e,
    // Beş VS vaat eder, üç tane verir ve hiçbiri hat tutmaz. Yazdığı çarpanın yirmide birini öder.
    lowball: { pay: 0.05 },
    reelBadge: 'VS',
    // Ağzı bandanalı: mimik uygulanmaz. Kafa hacmi şapkanın geniş kenarını da kapsar.
    model: { mask: true, head: { center: [0, 0.12, 0.02], radii: [0.36, 0.3, 0.36] } },
    look: { skin: 0xd9a37c, top: 0x6a4a2a, bottom: 0x3a2a1a, hair: 0x2a1a0a, beard: 0x2a1a0a },
    symbols: ['🤠', '🔫', '💰', '🐎', '⭐', '🥃', 'A', 'K'],
    theme: { bg: '#2e1f10', accent: '#d9a441' },
    lines: haydut,
  },
  {
    id: 'balikci',
    name: 'Balıkçı Dede',
    slotName: 'Tembel Göl',
    emoji: '🎣',
    maxWin: 8000,
    hp: 250,
    voice: { pitch: 0.55, rate: 0.9 },
    bloodColor: 0xc8102e,
    // İkinci perdeye geçecek gibi yapıp iki kez geri döner; son perdeye geçer ama orada hiç ödemez.
    // Makarada: göl balık doluyken balıkçı yoktur, tek bir 2x'lik balık varken gelir.
    stall: { times: 2 },
    noPayFinal: true,
    reelMode: 'fish',
    look: { skin: 0xd9a37c, top: 0x3a6a4a, bottom: 0x4a3a2a, hair: 0xd8d8d8, beard: 0xe8e8e8 },
    symbols: ['🎣', '🐟', '🪱', '🛶', '🪣', '🐸', 'A', 'K'],
    theme: { bg: '#0e2a3a', accent: '#7ad0e0' },
    lines: balikci,
  },
];
