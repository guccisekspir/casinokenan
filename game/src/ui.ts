import type { CharacterDef } from './characters';
import type { WeaponDef } from './weapons';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const fmt = (n: number) => n.toLocaleString('tr-TR');

const GOAL = 'öldürmeden max win\'i kopar · WASD: yürü';
const HINT: Record<WeaponDef['kind'], string> = {
  blunt: `${GOAL} · dokun: vur`,
  slash: `${GOAL} · basılı tutup sürükle: kes`,
  shot: `${GOAL} · dokun: ateş et`,
  saw: `${GOAL} · basılı tut: testere değdiği sürece keser`,
};

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

  showMenu(chars: CharacterDef[]) {
    $('cards').replaceChildren(
      ...chars.map((c) => {
        const b = document.createElement('button');
        b.className = 'card';
        b.innerHTML = `<b>${c.name}</b><small>${c.slotName}</small><em>${fmt(c.maxWin)}x</em>`;
        b.onclick = () => this.onPick(c);
        return b;
      }),
    );
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
    $('ch-name').textContent = def.name;
    $('ch-slot').textContent = def.slotName + (placeholder ? ' · geçici model' : '');
  }

  setAct(label: string) {
    $('ch-act').textContent = label;
  }

  setHp(ratio: number) {
    $('hp-fill').style.width = `${Math.max(0, ratio) * 100}%`;
  }

  setCoins(n: number) {
    $('coins').textContent = `${fmt(n)} jeton`;
  }

  setMuted(m: boolean) {
    $('btn-mute').textContent = m ? 'ses kapalı' : 'ses açık';
  }

  setWeapons(list: WeaponDef[], owned: Set<string>, current: string, coins: number) {
    $('weapons').replaceChildren(
      ...list.map((w) => {
        const b = document.createElement('button');
        const has = owned.has(w.id);
        b.className = 'weapon' + (w.id === current ? ' active' : '') + (has ? '' : coins >= w.price ? ' buyable' : ' locked');
        b.innerHTML = w.name + (has ? '' : `<small>${fmt(w.price)}</small>`);
        b.onclick = () => this.onWeapon(w.id);
        return b;
      }),
    );
    const cur = list.find((w) => w.id === current);
    if (cur) $('hint').textContent = HINT[cur.kind];
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
    $('btn-cash').textContent = `al ve çık · +${fmt(reward)} jeton`;
  }

  hideOffer() {
    $('offer').hidden = true;
  }

  showEnd(outcome: 'maxwin' | 'cashout' | 'death', def: CharacterDef, x: number, reward: number, promised?: number) {
    const t = {
      maxwin: { pre: `${def.name} pes etti`, title: 'Max Win', sub: `${fmt(def.maxWin)}x` },
      cashout: { pre: `${def.name} hâlâ ayakta`, title: `${fmt(x)}x`, sub: promised ? `${fmt(promised)}x yazdı, ${fmt(x)}x ödedi` : 'aldın ve çıktın' },
      death: { pre: `${def.name} öldü`, title: 'Kasa Kazandı', sub: 'ölü maskot ödeme yapmaz' },
    }[outcome];
    $('win-who').textContent = t.pre;
    $('win-title').textContent = t.title;
    $('win-title').classList.toggle('lost', outcome === 'death');
    $('win-x').textContent = t.sub;
    $('win-bonus').textContent = `+${fmt(reward)} jeton`;
    $('win').hidden = false;
  }
}
