import type { PlaceholderLook } from './character/placeholder';
import type { PartId } from './character/rig';

export interface CharacterDef {
  id: string;
  name: string;
  /** Karakterin "ait olduğu" uydurma slot oyununun adı. */
  slotName: string;
  emoji: string;
  /** Yeterince dövülünce verdiği çarpan. */
  maxWin: number;
  hp: number;
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
    /** Model kameraya bakmıyorsa Y ekseninde döndür (radyan). */
    rotationY?: number;
    /** Kullanılacak bekleme animasyonunun adı (yoksa adı "idle" geçen ya da ilk klip). */
    idleClip?: string;
    /** false: GLB'deki animasyonları yok say, prosedürel beklemeyi kullan. */
    useClips?: boolean;
    /** Otomatik kemik eşleme tutmazsa: parça -> kemik adı. */
    boneMap?: Partial<Record<PartId, string>>;
  };
  look: PlaceholderLook;
  symbols: string[];
  theme: { bg: string; accent: string };
  taunts: string[];
  /** II. perde: öfke, inkâr, azar. */
  midLines: string[];
  hitLines: string[];
  severLines: string[];
  lowLines: string[];
  deathLine: string;
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
    look: { skin: 0xe2b08a, top: 0xf4f1e6, bottom: 0xd9b23a, hair: 0xf2f2f2, beard: 0xffffff, crown: 0xf2c230, skirt: true },
    symbols: ['⚡', '👑', '💍', '⏳', '🏺', '🔷', '🟣', '🟢'],
    theme: { bg: '#2a1a5e', accent: '#ffd23f' },
    taunts: [
      'Bir spin daha at evlat, bu sefer kesin gelecek!',
      'Çarpan düştü ama... tüh, boş spinde düştü.',
      'Bonusa bir scatter kalmıştı! Bir tane!',
      'Ben yüz x veririm... başkasına.',
      'Bakiyen mi bitti? Yükle gel, bekliyorum.',
      'Dün birine beş bin x verdim. Sen değildin.',
      'Bonus satın al, bu sefer öder. Söz. Belki.',
      'Kaybettiğini çıkarmadan kalkılır mı hiç?',
    ],
    midLines: [
      'Sen kimsin de tanrıya el kaldırıyorsun?',
      'Ben adilim! Sertifikam var benim!',
      'Kaybetmeyi bilmeyen oynamasın!',
      'Bu yaptığın kurallara aykırı. Şikâyet edeceğim.',
      'Vurarak RTP yükselmez evlat.',
    ],
    hitLines: ['Ah! Bu bile ödemedi!', 'Vur vur, çarpan yine sıfır!', 'Of! Elin de bakiyen kadar hafif!', 'Bana vuracağına bir spin atsaydın!'],
    severLines: ['Kolum! Onunla çarpan atıyordum!', 'O uzuv bonus dışıydı!', 'Bu... bu oyunun kurallarında yok!'],
    lowLines: ['Dur dur! Bir sonraki spin kesin veriyorum!', 'Tamam, yirmi x vereyim, anlaşalım!', 'Şimşek çarpmasın seni... lütfen?', 'Ben yalnızca bir sayı üretecisiyim...', 'Makaralar durunca ben kimim ki?'],
    deathLine: 'Tamam! Tamam! Al sana MAX WIN!',
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
    taunts: [
      'Aaa, yine tumble olmadı! Çok üzüldüm. Hiç üzülmedim.',
      'Bomba geldi ama kazanç yoktu, ne tatlı değil mi?',
      'Canım, kasa hep kazanır. Ben kasayım.',
      'Bir tane daha lolipop gelseydi... ay gelmedi!',
      'Yükleme bonusu ister misin? Çevrim şartı sadece kırk kat!',
      'Bugün şanslı günün! Şaka şaka.',
      'Üç scatter geldi! Dördüncüyü ben yedim.',
    ],
    midLines: [
      'Ay sen ciddi misin şu an?',
      'Bana bak, destek hattını ararım!',
      'Kaybeden hep böyle huysuz olur zaten.',
      'Ben sana oyna demedim ki, kendin geldin!',
      'Elbisem leke oldu! Bunu bakiyenden keserim.',
    ],
    hitLines: ['Ay! Saçım!', 'Kaba şey! Bu da ödemez!', 'Iyy! Elin yapış yapış oldu!', 'Tacıma dokunma!'],
    severLines: ['Kolum! Yeni manikür yaptırmıştım!', 'O benim en tatlı tarafımdı!', 'Şurubum akıyor!'],
    lowLines: ['Tamam canım, sakin ol, free spin vereyim!', 'Dur! Çarpan bombası atacağım, söz!', 'Prensese vurulmaz!', 'Şekerim eriyor... beni kim hatırlayacak?', 'Ben de kazanmak isterdim, bir kere olsun.'],
    deathLine: 'Peki peki! Al MAX WIN senin olsun, kaba şey!',
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
    taunts: [
      'Kitap açıldı... en düşük sembol seçildi. Kader.',
      'Üç bin yıldır bekliyorum, sen de bir bonus bekle.',
      'Risk al, ikiye katla! Ya da hepsini bana bırak.',
      'Bu mezara giren bakiyesiz çıkar.',
      'İki kitap geldi. Üçüncüsü piramitte kaldı.',
      'Lanetli değilim, sadece RTP düşük.',
    ],
    midLines: [
      'Mezar soyguncuları bile daha kibardı.',
      'Bin yıllık lanet isteyen böyle davranır.',
      'Kitapta böyle bir özellik yok!',
      'Kayıp senin kaderindi, ben yalnızca yazdım.',
      'Bana vurma, sağlayıcıya vur!',
    ],
    hitLines: ['Sargılarım!', 'Mumyaya el kalkmaz!', 'Uf! Üç bin yıllık belim!', 'Lanetlerim seni!'],
    severLines: ['O parça müzelikti!', 'Onu üç bin yıldır taşıyordum!', 'Kumum dökülüyor!'],
    lowLines: ['Dur! Genişleyen sembol veriyorum!', 'Hazinenin yerini söylerim, vurma!', 'Tamam, on free spin!', 'Üç bin yıl bekledim... bunun için mi?', 'Kum saati benim için de akıyormuş.'],
    deathLine: 'Yeter! Hazine senin... MAX WIN!',
  },
];
