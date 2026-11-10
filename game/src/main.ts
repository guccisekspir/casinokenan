import './style.css';
import { Audio } from './audio';
import { CHARACTERS, type CharacterDef } from './characters';
import { Game } from './game';
import { applyStatic, fmt, onLang, t, type Key } from './i18n';
import { Landing } from './landing';
import { UI } from './ui';
import { WEAPONS } from './weapons';

const SAVE_KEY = 'slot-dayagi-v1';
const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const ui = new UI();
const audio = new Audio();
const game = new Game(el<HTMLCanvasElement>('scene'), el<HTMLCanvasElement>('trail'), ui, audio);

// Kayıt: bakiye + sahip olunan silahlar.
try {
  const s = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null');
  if (s) {
    game.coins = Number(s.coins) || 0;
    for (const id of s.owned ?? []) if (WEAPONS.some((w) => w.id === id)) game.owned.add(id);
  }
} catch {
  /* bozuk kayıt: sıfırdan başla */
}
// Şimdilik bütün silahlar açık (deneme sürümü). Jetonla açma düzeni için bu satırı kaldırın.
WEAPONS.forEach((w) => game.owned.add(w.id));

const refresh = () => {
  ui.setCoins(game.coins);
  ui.setWeapons(WEAPONS, game.owned, game.weapon.id, game.coins);
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ coins: game.coins, owned: [...game.owned] }));
  } catch {
    /* depolama kapalı olabilir */
  }
};
game.onChange = refresh;

let current: CharacterDef | null = null;
const play = async (def: CharacterDef) => {
  current = def;
  audio.unlock();
  ui.loading(true);
  await game.start(def);
  ui.loading(false);
  ui.showGame();
  refresh();
};

ui.onPick = play;
ui.onRetry = () => current && play(current);
ui.onCash = () => game.cashOut();
ui.onMenu = () => {
  game.stop();
  ui.showMenu();
  landing.enter();
};
ui.onWeapon = (id) => {
  audio.unlock();
  if (!game.selectWeapon(id)) {
    const w = WEAPONS.find((x) => x.id === id)!;
    ui.toast(t('toast.need', { w: t(`w.${w.id}` as Key), n: fmt(w.price - game.coins) }));
  }
};
ui.onMute = () => {
  audio.setMuted(!audio.muted);
  ui.setMuted(audio.muted);
};

const landing = new Landing(CHARACTERS, WEAPONS, (def) => void play(def));
applyStatic();
onLang(() => {
  refresh();
  ui.setMuted(audio.muted);
});
ui.setMuted(false);
ui.showMenu();
landing.enter();
refresh();

// Konsoldan kurcalamak için (ör. game.coins = 99999).
(window as unknown as { game: Game }).game = game;

// Dokunmatik yürüme çubuğu -> oyuncu hareketi.
{
  const stick = el<HTMLDivElement>('stick'), knob = el<HTMLDivElement>('stick-knob');
  const set = (e: PointerEvent | null) => {
    let x = 0, y = 0;
    if (e) {
      const r = stick.getBoundingClientRect();
      x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const len = Math.hypot(x, y);
      if (len > 1) {
        x /= len;
        y /= len;
      }
    }
    knob.style.transform = `translate(${x * 32}px, ${y * 32}px)`;
    game.stick.x = x;
    game.stick.y = -y; // yukarı = ileri
  };
  stick.addEventListener('pointerdown', (e) => {
    stick.setPointerCapture(e.pointerId);
    audio.unlock();
    set(e);
  });
  stick.addEventListener('pointermove', (e) => {
    if (stick.hasPointerCapture(e.pointerId)) set(e);
  });
  for (const type of ['pointerup', 'pointercancel'] as const) stick.addEventListener(type, () => set(null));
}
