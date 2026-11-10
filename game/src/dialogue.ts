import type { Audio } from './audio';
import type { CharacterDef } from './characters';

/**
 * Konuşma yönetmeni. Oyun "ne oldu"yu (olay) bildirir; hangi repliğin, ne zaman söyleneceğine
 * burası karar verir:
 *  - Her olayın birden çok alternatifi vardır; hepsi söylenmeden hiçbiri tekrar etmez.
 *  - Olayların önceliği vardır: önemli bir olay (uzuv koptu) süren lafı keser, önemsiz olan
 *    (hafif vuruş) keser gibi yapmaz, susar.
 *  - Sık olan olaylar (vuruş, ıska) hem olasılıkla hem bekleme süresiyle seyreltilir.
 *
 * Ses: her replik için `public/audio/<karakter>/<olay>_<n>.mp3` aranır. Dosya varsa o çalar,
 * yoksa tarayıcının sesli okuması devreye girer. Liste: `npm run voice-list`.
 */
export type DialogueEvent =
  | 'intro'
  | 'idle_1' | 'idle_2' | 'idle_3'
  | 'hit_head' | 'hit_body' | 'hit_arm' | 'hit_leg' | 'miss'
  | 'weapon_knuckles' | 'weapon_katana' | 'weapon_gun' | 'weapon_saber' | 'weapon_saw' | 'weapon_slap' | 'buried'
  | 'sever_arm' | 'sever_leg'
  | 'offer_small' | 'offer_mid' | 'offer_big'
  | 'recover' | 'near_death' | 'aloof_hit' | 'block' | 'stall'
  | 'cashout' | 'maxwin' | 'death';

interface Rule {
  /** Büyük olan, süren konuşmayı keser. */
  pri: number;
  /** Aynı olayın yeniden konuşulabilmesi için geçmesi gereken süre (sn). */
  cooldown?: number;
  /** Olay her gerçekleştiğinde konuşma olasılığı. */
  chance?: number;
}

/** Olay açıklamaları ses listesinde de kullanılır. */
export const EVENT_INFO: Record<DialogueEvent, Rule & { when: string }> = {
  intro: { pri: 9, when: 'Sahne açılışı. Övünür ve ilk çarpanı (2x) gösterir.' },
  idle_1: { pri: 1, when: 'I. perde (Kibir): oyuncu beklerken kışkırtma.' },
  idle_2: { pri: 1, when: 'II. perde (Öfke): azar, inkâr.' },
  idle_3: { pri: 1, when: 'III. perde (Yakarış): yalvarma, pazarlık.' },
  hit_head: { pri: 3, cooldown: 4, chance: 0.4, when: 'Kafasına vuruldu.' },
  hit_body: { pri: 3, cooldown: 4, chance: 0.3, when: 'Gövdesine vuruldu.' },
  hit_arm: { pri: 3, cooldown: 4, chance: 0.35, when: 'Koluna / eline vuruldu.' },
  hit_leg: { pri: 3, cooldown: 4, chance: 0.35, when: 'Bacağına / ayağına vuruldu.' },
  miss: { pri: 2, cooldown: 7, chance: 0.6, when: 'Oyuncu ıskaladı.' },
  weapon_knuckles: { pri: 6, cooldown: 20, when: 'Oyuncu muştayı eline aldı.' },
  weapon_katana: { pri: 6, cooldown: 20, when: 'Oyuncu katanayı eline aldı.' },
  weapon_gun: { pri: 6, cooldown: 20, when: 'Oyuncu tabancayı eline aldı.' },
  weapon_saber: { pri: 6, cooldown: 20, when: 'Oyuncu ışın kılıcını eline aldı.' },
  weapon_saw: { pri: 6, cooldown: 20, when: 'Oyuncu testereyi çalıştırdı.' },
  weapon_slap: { pri: 6, cooldown: 20, when: 'Oyuncu Osmanlı tokadını seçti (elini açtı).' },
  buried: { pri: 8, when: 'Osmanlı tokadını yedi, göğsüne kadar yere gömüldü.' },
  sever_arm: { pri: 8, when: 'Kolu / ön kolu koptu.' },
  sever_leg: { pri: 8, when: 'Bacağı / baldırı koptu.' },
  offer_small: { pri: 7, when: 'Çarpan yükseldi (5x – 25x): hâlâ alaycı.' },
  offer_mid: { pri: 7, when: 'Çarpan yükseldi (50x – 250x): gönülsüz.' },
  offer_big: { pri: 7, when: 'Çarpan yükseldi (500x ve üstü): çaresiz.' },
  recover: { pri: 5, cooldown: 9, when: 'Oyuncu durdu, çarpan geri düştü: yine kibirlenir.' },
  near_death: { pri: 7, cooldown: 10, when: 'Canı çok azaldı: "ölürsem ödeme yok" uyarısı.' },
  aloof_hit: { pri: 6, cooldown: 5, when: 'Oyuncuyu umursamazken (sırtı dönük, volta) vuruldu.' },
  block: { pri: 9, when: 'Yalnızca set çeken maskot: oyuncu tam max alacakken önüne yeni bir parmaklık çeker.' },
  stall: { pri: 9, when: 'Yalnızca oyalayan maskot: ikinci perdeye geçecek gibi yapar, geçmez.' },
  cashout: { pri: 10, when: 'Oyuncu teklifi alıp çıktı: alay eder.' },
  maxwin: { pri: 10, when: 'Pes etti, max win veriyor.' },
  death: { pri: 10, when: 'Öldü (oyuncu kaybetti): son sözleri.' },
};

export type Lines = Partial<Record<DialogueEvent, string[]>>;

export class Dialogue {
  /** Bir replik başladığında: metin + tahmini süre (altyazı, kafa sallama, makara için). */
  onSpeak: (text: string, seconds: number) => void = () => {};

  private bags = new Map<string, number[]>();
  private lastUsed = new Map<string, number>();
  private last = '';
  private speakingPri = 0;
  private speakingUntil = 0;
  private clip: HTMLAudioElement | null = null;
  private missing = new Set<string>();
  private now = 0;

  /** @param lang repliklerin dili: sesli okuma yedeği ve kayıt klasörü buna göre seçilir */
  constructor(private def: CharacterDef, private lines: Lines, private audio: Audio, private lang: 'tr' | 'en' = 'tr') {}

  get speaking(): boolean {
    return this.now < this.speakingUntil;
  }

  update(realDt: number) {
    this.now += realDt;
  }

  /**
   * Bir olayı bildirir. Replik söylendiyse true döner.
   * @param force olasılık ve bekleme süresini yok say (öncelik kuralı yine geçerli).
   */
  trigger(event: DialogueEvent, force = false): boolean {
    const rule = EVENT_INFO[event];
    const options = this.lines[event];
    if (!options?.length) return false;
    if (this.speaking && rule.pri <= this.speakingPri) return false;
    if (!force) {
      if (rule.cooldown && this.now - (this.lastUsed.get(event) ?? -1e9) < rule.cooldown) return false;
      if (rule.chance !== undefined && Math.random() > rule.chance) return false;
    }

    const i = this.draw(event, options.length);
    const text = options[i];
    this.last = `${event}_${i}`;
    this.lastUsed.set(event, this.now);

    const estimate = 1.4 + text.length * 0.062;
    this.speakingPri = rule.pri;
    this.speakingUntil = this.now + estimate;
    this.onSpeak(text, estimate);
    // Kayıtlar: Türkçe `audio/<id>/`, İngilizce `audio/en/<id>/`.
    this.play(`audio/${this.lang === 'en' ? 'en/' : ''}${this.def.id}/${event}_${i + 1}.mp3`, text);
    return true;
  }

  stop() {
    this.clip?.pause();
    this.clip = null;
    window.speechSynthesis?.cancel();
    this.speakingUntil = 0;
  }

  /** Torbadan çek: tüm alternatifler bitmeden tekrar yok, torba yenilenince de üst üste aynı replik yok. */
  private draw(event: string, n: number): number {
    let bag = this.bags.get(event);
    if (!bag?.length) {
      bag = Array.from({ length: n }, (_, k) => k);
      for (let k = n - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [bag[k], bag[j]] = [bag[j], bag[k]];
      }
      // Yeni torbanın ilk çekilişi (dizinin sonu) az önce söylenenle aynı olmasın.
      if (n > 1 && `${event}_${bag[n - 1]}` === this.last) [bag[0], bag[n - 1]] = [bag[n - 1], bag[0]];
      this.bags.set(event, bag);
    }
    return bag.pop()!;
  }

  private play(url: string, text: string) {
    this.clip?.pause();
    this.clip = null;
    window.speechSynthesis?.cancel();
    if (this.audio.muted) return;
    if (this.missing.has(url)) {
      this.audio.speak(text, this.def.voice, this.lang);
      return;
    }
    const el = document.createElement('audio');
    this.clip = el;
    el.preload = 'auto';
    el.onloadedmetadata = () => {
      // Gerçek kayıt süresi biliniyor: konuşma süresini ona göre düzelt.
      if (this.clip === el && Number.isFinite(el.duration)) {
        this.speakingUntil = this.now + el.duration + 0.2;
        this.onSpeak(text, el.duration + 0.4);
      }
    };
    el.onerror = () => {
      this.missing.add(url);
      if (this.clip === el) {
        this.clip = null;
        this.audio.speak(text, this.def.voice, this.lang);
      }
    };
    el.src = url;
    this.audio.attachVoice(el); // genlik -> dudak hareketi
    void el.play().catch(() => {});
  }
}
