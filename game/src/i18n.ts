/**
 * Arayüz dili. Varsayılan İngilizce; seçim tarayıcıda saklanır.
 * Maskotların replikleri (src/lines) şimdilik yalnızca Türkçe: altyazı ve ses Türkçe kalır.
 */
export type Lang = 'en' | 'tr';

const en = {
  // --- landing
  'nav.bosses': 'Bosses',
  'nav.rules': 'Rules',
  'nav.arsenal': 'Arsenal',
  'hero.kicker': 'A revenge in three acts',
  'hero.l1': 'The house',
  'hero.l2': 'always',
  'hero.l3': 'wins.',
  'hero.fix': 'bleeds.',
  'hero.lede': 'The reels spun. They paid nothing, again. Tonight the mascot pays.',
  'hero.cta': 'Pick your boss',
  'hero.meter': 'what the slot showed you',
  'hero.meter2': 'what it paid',
  'ticker': 'One more spin, it will land this time · You were one scatter away · The house always wins · Top up and come back · I paid five thousand x yesterday. Not to you · Bonus buy pays this time. Promise. Maybe',
  'bosses.title': 'The bosses',
  'bosses.sub': 'Four mascots. Four ways of not paying.',
  'boss.maxwin': 'max win',
  'boss.play': 'Beat him',
  'boss.trick': 'His trick',
  'rules.title': 'The rule',
  'rules.big': 'Take the max win. Do not kill him.',
  'rules.1.t': 'Hubris',
  'rules.1.d': 'He brags, turns his back, shows you two x. Every hit corners him and the multiplier climbs.',
  'rules.2.t': 'Rage',
  'rules.2.d': 'He scolds, guards, staggers. Stop hitting and he recovers. The multiplier slides back down.',
  'rules.3.t': 'Mercy',
  'rules.3.d': 'He kneels and begs. One hit too many and he dies. A dead mascot pays nothing. The house wins.',
  'arsenal.title': 'The arsenal',
  'arsenal.sub': 'Limbs come off. Heads too, but then nobody pays you.',
  'foot.note': 'A parody. No real money, no betting. On real slots the house always wins.',
  'foot.voice': 'The mascots speak Turkish.',
  // --- game
  'hud.exit': 'exit',
  'hud.soundOn': 'sound on',
  'hud.soundOff': 'sound off',
  'hud.coins': 'coins',
  'hud.cash': 'cash out',
  'hud.placeholder': 'placeholder model',
  'hud.act': 'act',
  'hint.goal': 'take the max win without killing him · WASD: walk',
  'hint.blunt': 'tap: hit',
  'hint.slash': 'hold and drag: cut',
  'hint.shot': 'tap: fire',
  'hint.saw': 'hold: the saw cuts while it touches',
  'toast.far': 'too far — get closer',
  'toast.block': 'he dropped a gate — max is shut',
  'toast.blockLast': 'last gate — he is out of iron',
  'toast.need': '{w} needs {n} more coins.',
  'act.1': 'Hubris', 'act.1.sub': 'the house always wins',
  'act.2': 'Rage', 'act.2.sub': 'sore losers should not play',
  'act.3': 'Mercy', 'act.3.sub': 'when the reels stop',
  'end.gaveUp': '{n} gave up',
  'end.standing': '{n} is still standing',
  'end.dead': '{n} is dead',
  'end.house': 'The House Wins',
  'end.deadSub': 'a dead mascot pays nothing',
  'end.cashSub': 'you took it and left',
  'end.lowSub': 'showed {a}x, paid {b}x',
  'end.retry': 'again',
  'end.other': 'another boss',
  'end.fin': '— the end —',
  'loading': 'loading…',
  'w.fist': 'Fist', 'w.knuckles': 'Knuckles', 'w.katana': 'Katana', 'w.gun': 'Pistol', 'w.saber': 'Light Blade', 'w.saw': 'Chainsaw',
  'wd.fist': 'Free. Honest. Slow.', 'wd.knuckles': 'Same fist, more regret.', 'wd.katana': 'Drag to cut. Two passes per limb.',
  'wd.gun': 'Unlimited range. Loud.', 'wd.saber': 'One pass. No blood, it cauterizes.', 'wd.saw': 'Hold it on him. It keeps cutting.',
  // --- bosses
  'b.simsek-dede.name': 'Grandpa Thunder', 'b.simsek-dede.slot': 'Gates of the Clouds',
  'b.simsek-dede.trick': 'Brags about his multipliers, then shows you two x.',
  'b.asansorcu.name': 'The Liftman', 'b.asansorcu.slot': 'The Hell Floor',
  'b.asansorcu.trick': 'His lift only goes down. So does your balance.',
  'b.demirci.name': 'The Smith', 'b.demirci.slot': "The Wanderer's Forge",
  'b.demirci.trick': 'Puts MAX on the screen, then drops a gate in front of it. Twice.',
  'b.haydut.name': 'The Outlaw', 'b.haydut.slot': 'Duel Town',
  'b.haydut.trick': 'Promises five VS. Gives three, none on a line. Shows 100x, pays 5x.',
};

const tr: Record<keyof typeof en, string> = {
  'nav.bosses': 'Bosslar',
  'nav.rules': 'Kural',
  'nav.arsenal': 'Silahlar',
  'hero.kicker': 'Üç perdelik bir intikam',
  'hero.l1': 'Kasa',
  'hero.l2': 'hep',
  'hero.l3': 'kazanır.',
  'hero.fix': 'kanar.',
  'hero.lede': 'Makaralar döndü. Yine vermedi. Bu gece maskot verecek.',
  'hero.cta': 'Bossunu seç',
  'hero.meter': 'slotun sana gösterdiği',
  'hero.meter2': 'ödediği',
  'ticker': 'Bir spin daha at, bu sefer kesin gelecek · Bonusa bir scatter kalmıştı · Kasa hep kazanır · Yükle gel, bekliyorum · Dün birine beş bin x verdim. Sen değildin · Bonus satın al, bu sefer öder. Söz. Belki',
  'bosses.title': 'Bosslar',
  'bosses.sub': 'Dört maskot. Ödememenin dört yolu.',
  'boss.maxwin': 'max win',
  'boss.play': 'Döv',
  'boss.trick': 'Numarası',
  'rules.title': 'Kural',
  'rules.big': 'Max win\'i kopar. Öldürme.',
  'rules.1.t': 'Kibir',
  'rules.1.d': 'Övünür, sırtını döner, sana iki x gösterir. Her vuruş onu sıkıştırır, çarpan tırmanır.',
  'rules.2.t': 'Öfke',
  'rules.2.d': 'Azarlar, korunur, sersemler. Vurmayı bırakırsan toparlanır. Çarpan geri iner.',
  'rules.3.t': 'Yakarış',
  'rules.3.d': 'Diz çöker, yalvarır. Bir vuruş fazla ve ölür. Ölü maskot ödeme yapmaz. Kasa kazanır.',
  'arsenal.title': 'Silahlar',
  'arsenal.sub': 'Uzuvlar kopar. Kafa da kopar, ama o zaman kimse ödemez.',
  'foot.note': 'Parodidir. Gerçek para yok, bahis yok. Gerçek slotlarda kasa hep kazanır.',
  'foot.voice': '',
  'hud.exit': 'çık',
  'hud.soundOn': 'ses açık',
  'hud.soundOff': 'ses kapalı',
  'hud.coins': 'jeton',
  'hud.cash': 'al ve çık',
  'hud.placeholder': 'geçici model',
  'hud.act': 'perde',
  'hint.goal': 'öldürmeden max win\'i kopar · WASD: yürü',
  'hint.blunt': 'dokun: vur',
  'hint.slash': 'basılı tutup sürükle: kes',
  'hint.shot': 'dokun: ateş et',
  'hint.saw': 'basılı tut: testere değdiği sürece keser',
  'toast.far': 'çok uzaksın — yaklaş',
  'toast.block': 'set çekti — max kapandı',
  'toast.blockLast': 'son seti çekti — demiri bitti',
  'toast.need': '{w} için {n} jeton daha gerek.',
  'act.1': 'Kibir', 'act.1.sub': 'kasa hep kazanır',
  'act.2': 'Öfke', 'act.2.sub': 'kaybetmeyi bilmeyen oynamasın',
  'act.3': 'Yakarış', 'act.3.sub': 'makaralar durunca',
  'end.gaveUp': '{n} pes etti',
  'end.standing': '{n} hâlâ ayakta',
  'end.dead': '{n} öldü',
  'end.house': 'Kasa Kazandı',
  'end.deadSub': 'ölü maskot ödeme yapmaz',
  'end.cashSub': 'aldın ve çıktın',
  'end.lowSub': '{a}x yazdı, {b}x ödedi',
  'end.retry': 'yeniden',
  'end.other': 'başka bir boss',
  'end.fin': '— son —',
  'loading': 'yükleniyor…',
  'w.fist': 'Yumruk', 'w.knuckles': 'Muşta', 'w.katana': 'Katana', 'w.gun': 'Tabanca', 'w.saber': 'Işın Kılıcı', 'w.saw': 'Testere',
  'wd.fist': 'Bedava. Dürüst. Yavaş.', 'wd.knuckles': 'Aynı yumruk, daha çok pişmanlık.', 'wd.katana': 'Sürükle, kes. Uzuv başına iki geçiş.',
  'wd.gun': 'Menzil sınırsız. Gürültülü.', 'wd.saber': 'Tek geçiş. Kan yok, dağlar.', 'wd.saw': 'Üstünde tut. Kesmeye devam eder.',
  'b.simsek-dede.name': 'Şimşek Dede', 'b.simsek-dede.slot': 'Bulutların Kapısı',
  'b.simsek-dede.trick': 'Çarpanlarıyla övünür, sonra sana iki x gösterir.',
  'b.asansorcu.name': 'Asansörcü', 'b.asansorcu.slot': 'Cehennem Katı',
  'b.asansorcu.trick': 'Asansörü yalnızca aşağı iner. Bakiyen de.',
  'b.demirci.name': 'Demirci', 'b.demirci.slot': 'Yolcunun Ocağı',
  'b.demirci.trick': 'MAX\'ı ekrana koyar, sonra önüne set çeker. İki kez.',
  'b.haydut.name': 'Haydut', 'b.haydut.slot': 'Düello Kasabası',
  'b.haydut.trick': 'Beş VS vaat eder. Üç verir, hiçbiri hat tutmaz. 100x yazar, 5x öder.',
};

export type Key = keyof typeof en;
const DICT: Record<Lang, Record<Key, string>> = { en, tr };
const STORE = 'slot-dayagi-lang';

let lang: Lang = 'en';
try {
  const saved = localStorage.getItem(STORE);
  if (saved === 'tr' || saved === 'en') lang = saved;
} catch {
  /* depolama kapalı olabilir */
}

const listeners = new Set<() => void>();

export const getLang = () => lang;
export const numLocale = () => (lang === 'tr' ? 'tr-TR' : 'en-US');
export const fmt = (n: number) => n.toLocaleString(numLocale());

export function setLang(next: Lang) {
  if (next === lang) return;
  lang = next;
  try {
    localStorage.setItem(STORE, next);
  } catch {
    /* depolama kapalı olabilir */
  }
  applyStatic();
  listeners.forEach((fn) => fn());
}

export function onLang(fn: () => void) {
  listeners.add(fn);
}

export function t(key: Key, vars?: Record<string, string | number>): string {
  let s = DICT[lang][key] ?? en[key];
  if (vars) for (const k in vars) s = s.replace(`{${k}}`, String(vars[k]));
  return s;
}

/** Boss adı / slot adı / numarası: dile göre; sözlükte yoksa tanımdaki Türkçe ad. */
export function boss(id: string, field: 'name' | 'slot' | 'trick', fallback = ''): string {
  const key = `b.${id}.${field}` as Key;
  return key in en ? t(key) : fallback;
}

/** `data-i18n` taşıyan sabit metinleri günceller. */
export function applyStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n as Key);
  });
}
