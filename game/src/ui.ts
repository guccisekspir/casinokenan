import type { CharacterDef } from './characters';
import type { WeaponDef } from './weapons';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const fmt = (n: number) => n.toLocaleString('tr-TR');

const HINT: Record<WeaponDef['kind'], string> = {
  blunt: 'Tıkla / dokun: vur',
  slash: 'Basılı tutup sürükle: kes',
  shot: 'Tıkla / dokun: ateş et',
};

export class UI {
  onPick: (def: CharacterDef) => void = () => {};
  onWeapon: (id: string) => void = () => {};
  onMute: () => void = () => {};
  onMenu: () => void = () => {};
  onRetry: () => void = () => {};

  private bubbleTimer = 0;

  constructor() {
    $('btn-menu').onclick = () => this.onMenu();
    $('btn-mute').onclick = () => this.onMute();
    $('btn-retry').onclick = () => this.onRetry();
    $('btn-other').onclick = () => this.onMenu();
  }

  showMenu(chars: CharacterDef[]) {
    const cards = $('cards');
    cards.replaceChildren(
      ...chars.map((c) => {
        const b = document.createElement('button');
        b.className = 'card';
        b.style.setProperty('--accent', c.theme.accent);
        b.style.setProperty('--bg', c.theme.bg);
        b.innerHTML = `<span class="emoji">${c.emoji}</span><b>${c.name}</b><small>${c.slotName}</small><em>MAX WIN ${fmt(c.maxWin)}x</em>`;
        b.onclick = () => this.onPick(c);
        return b;
      }),
    );
    $('menu').hidden = false;
    $('hud').hidden = true;
    $('win').hidden = true;
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
    $('hp-label').textContent = "MAX WIN'E KALAN SABRI";
  }

  setHp(ratio: number) {
    $('hp-fill').style.width = `${Math.max(0, ratio) * 100}%`;
  }

  setCoins(n: number) {
    $('coins').textContent = `🪙 ${fmt(n)}`;
  }

  setMuted(m: boolean) {
    $('btn-mute').textContent = m ? '🔇' : '🔊';
  }

  setWeapons(list: WeaponDef[], owned: Set<string>, current: string, coins: number) {
    $('weapons').replaceChildren(
      ...list.map((w) => {
        const b = document.createElement('button');
        const has = owned.has(w.id);
        b.className = 'weapon' + (w.id === current ? ' active' : '') + (has ? '' : coins >= w.price ? ' buyable' : ' locked');
        b.innerHTML = `<span>${w.icon}</span><small>${has ? w.name : `🪙 ${fmt(w.price)}`}</small>`;
        b.title = has ? w.name : `${w.name} — ${fmt(w.price)} jeton`;
        b.onclick = () => this.onWeapon(w.id);
        return b;
      }),
    );
    const cur = list.find((w) => w.id === current);
    if (cur) $('hint').textContent = HINT[cur.kind];
  }

  bubble(text: string | null, seconds = 2) {
    const el = $('bubble');
    window.clearTimeout(this.bubbleTimer);
    if (!text) {
      el.hidden = true;
      return;
    }
    el.textContent = text;
    el.hidden = false;
    this.bubbleTimer = window.setTimeout(() => (el.hidden = true), seconds * 1000);
  }

  bubblePos(x: number, y: number) {
    const el = $('bubble');
    const half = Math.min(150, window.innerWidth / 2 - 8);
    const cx = Math.max(half + 8, Math.min(window.innerWidth - half - 8, x));
    el.style.transform = `translate(${cx}px, ${Math.max(70, y)}px) translate(-50%, -100%)`;
  }

  floater(x: number, y: number, text: string, cls = '') {
    const el = document.createElement('span');
    el.className = `floater ${cls}`;
    el.textContent = text;
    el.style.left = `${x + (Math.random() - 0.5) * 30}px`;
    el.style.top = `${y}px`;
    el.onanimationend = () => el.remove();
    $('floaters').append(el);
  }

  toast(text: string) {
    this.floater(window.innerWidth / 2, window.innerHeight - 150, text, 'toast');
  }

  showWin(def: CharacterDef, bonus: number) {
    $('win-x').textContent = `${fmt(def.maxWin)}x`;
    $('win-who').textContent = `${def.name} pes etti`;
    $('win-bonus').textContent = `+${fmt(bonus)} 🪙`;
    $('win').hidden = false;
  }
}
