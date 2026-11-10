import type { CharacterDef } from './characters';
import { CoinRain } from './coinrain';
import { boss, fmt, t, type Key } from './i18n';
import type { WeaponDef } from './weapons';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
/** Arayüz bir film çerçevesi gibi: sinemaskop şeritleri, altyazı, ara yazılar. */
export class UI {
  onPick: (def: CharacterDef) => void = () => {};
  onWeapon: (id: string) => void = () => {};
  onMute: () => void = () => {};
  onMenu: () => void = () => {};
  onRetry: () => void = () => {};
  onCash: () => void = () => {};
  /** Bir tur bitti ve bitiş kartı gösterildi. */
  onEnd: (outcome: 'maxwin' | 'cashout' | 'death', def: CharacterDef, x: number) => void = () => {};
  private rain = new CoinRain($<HTMLCanvasElement>('coinrain'));
  private countRaf = 0;

  private subTimer = 0;

  constructor() {
    $('btn-menu').onclick = () => this.onMenu();
    $('btn-mute').onclick = () => this.onMute();
    $('btn-retry').onclick = () => this.onRetry();
    $('btn-other').onclick = () => this.onMenu();
    $('btn-cash').onclick = () => this.onCash();
  }

  /** Max win anı: paralar yağmaya başlar (bitiş kartı gelmeden önce). */
  celebrate() {
    this.rain.start(9);
  }

  showMenu() {
    this.rain.stop();
    $('menu').hidden = false;
    $('hud').hidden = true;
    $('win').hidden = true;
    $('card').hidden = true;
  }

  showGame() {
    this.rain.stop();
    $('menu').hidden = true;
    $('win').hidden = true;
    $('hud').hidden = false;
  }

  loading(on: boolean) {
    $('loading').hidden = !on;
  }

  setCharacter(def: CharacterDef, placeholder: boolean) {
    $('ch-name').textContent = boss(def.id, 'name', def.name);
    $('ch-slot').textContent = boss(def.id, 'slot', def.slotName) + (placeholder ? ` · ${t('hud.placeholder')}` : '');
  }

  setAct(label: string) {
    $('ch-act').textContent = label;
  }

  setHp(ratio: number) {
    $('hp-fill').style.width = `${Math.max(0, ratio) * 100}%`;
  }

  setCoins(n: number) {
    $('coins').textContent = `${fmt(n)} ${t('hud.coins')}`;
  }

  setMuted(m: boolean) {
    $('btn-mute').textContent = t(m ? 'hud.soundOff' : 'hud.soundOn');
  }

  setWeapons(list: WeaponDef[], owned: Set<string>, current: string, coins: number) {
    $('weapons').replaceChildren(
      ...list.map((w) => {
        const b = document.createElement('button');
        const has = owned.has(w.id);
        b.className = 'weapon' + (w.id === current ? ' active' : '') + (has ? '' : coins >= w.price ? ' buyable' : ' locked');
        b.innerHTML = t(`w.${w.id}` as Key) + (has ? '' : `<small>${fmt(w.price)}</small>`);
        b.onclick = () => this.onWeapon(w.id);
        return b;
      }),
    );
    const cur = list.find((w) => w.id === current);
    if (cur) $('hint').textContent = `${t('hint.goal')} · ${t(`hint.${cur.kind}` as Key)}`;
  }

  /** Karakterin repliği: film altyazısı. */
  subtitle(text: string | null, seconds = 2) {
    const el = $('subtitle');
    window.clearTimeout(this.subTimer);
    el.hidden = true;
    if (!text) return;
    el.textContent = `— ${text}`;
    void el.offsetWidth; // animasyonu yeniden başlat
    el.hidden = false;
    this.subTimer = window.setTimeout(() => (el.hidden = true), seconds * 1000);
  }

  /**
   * Ara yazı (perde başlığı). Varsayılan: sahneyi kapatmayan üst bant.
   * @param full yalnızca sahne açılışında: tam ekran
   */
  card(top: string, main: string, sub: string, seconds: number, full = false) {
    const el = $('card');
    el.classList.toggle('full', full);
    $('card-top').textContent = top;
    $('card-main').textContent = main;
    $('card-sub').textContent = sub;
    el.style.setProperty('--dur', `${seconds}s`);
    el.hidden = true;
    void el.offsetWidth;
    el.hidden = false;
    el.onanimationend = () => (el.hidden = true);
  }

  toast(text: string) {
    const el = document.createElement('span');
    el.className = 'toast';
    el.textContent = text;
    el.onanimationend = () => el.remove();
    $('toasts').replaceChildren(el);
  }

  /** Karakterin o an verdiği çarpan + "al ve çık" düğmesi. */
  /** @param promised eksik ödeyen maskotta: ekrana yazdığı (ödemediği) çarpan */
  setOffer(x: number, reward: number, promised?: number) {
    $('offer').hidden = false;
    $('offer-x').innerHTML = promised ? `<s>${fmt(promised)}x</s> ${fmt(x)}x` : `${fmt(x)}x`;
    $('btn-cash').textContent = `${t('hud.cash')} · +${fmt(reward)} ${t('hud.coins')}`;
  }

  hideOffer() {
    $('offer').hidden = true;
  }

  showEnd(outcome: 'maxwin' | 'cashout' | 'death', def: CharacterDef, x: number, reward: number, promised?: number) {
    const n = boss(def.id, 'name', def.name);
    const c = {
      maxwin: { pre: t('end.gaveUp', { n }), title: 'Max Win', sub: `${fmt(def.maxWin)}x` },
      cashout: {
        pre: t('end.standing', { n }), title: `${fmt(x)}x`,
        sub: promised ? t('end.lowSub', { a: fmt(promised), b: fmt(x) }) : t('end.cashSub'),
      },
      death: { pre: t('end.dead', { n }), title: t('end.house'), sub: t('end.deadSub') },
    }[outcome];
    $('win-who').textContent = c.pre;
    $('win-title').textContent = c.title;
    $('win-title').classList.toggle('lost', outcome === 'death');
    $('win-x').textContent = c.sub;
    $('win-bonus').textContent = `+${fmt(reward)} ${t('hud.coins')}`;
    $('win').hidden = false;
    $('win').classList.toggle('jackpot', outcome === 'maxwin');
    cancelAnimationFrame(this.countRaf);
    if (outcome === 'maxwin') {
      // Çarpan sıfırdan max win'e sayarak çıkar; para yağışı kart boyunca sürer.
      this.rain.start(7);
      const t0 = performance.now(), el = $('win-x');
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 2400), e = 1 - Math.pow(1 - k, 4);
        el.textContent = `${fmt(Math.round(def.maxWin * e))}x`;
        if (k < 1) this.countRaf = requestAnimationFrame(step);
      };
      this.countRaf = requestAnimationFrame(step);
    }
    this.onEnd(outcome, def, outcome === 'maxwin' ? def.maxWin : outcome === 'cashout' ? x : 0);
  }
}
