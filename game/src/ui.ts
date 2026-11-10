import type { CharacterDef } from './characters';
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

  private subTimer = 0;

  constructor() {
    $('btn-menu').onclick = () => this.onMenu();
    $('btn-mute').onclick = () => this.onMute();
    $('btn-retry').onclick = () => this.onRetry();
    $('btn-other').onclick = () => this.onMenu();
    $('btn-cash').onclick = () => this.onCash();
  }

  showMenu() {
    $('menu').hidden = false;
    $('hud').hidden = true;
    $('win').hidden = true;
    $('card').hidden = true;
  }

  showGame() {
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

  /** Tam ekran ara yazı (perde başlığı). */
  card(top: string, main: string, sub: string, seconds: number) {
    const el = $('card');
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
  }
}
