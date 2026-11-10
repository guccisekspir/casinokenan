import type { CharacterDef } from './characters';
import { applyStatic, boss, fmt, getLang, onLang, setLang, t, type Key, type Lang } from './i18n';
import type { WeaponDef } from './weapons';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Açılış sayfası: marka, bosslar (dikey afiş kartları), kural ve silahlar.
 * Metinler i18n'den gelir; dil değişince yeniden kurulur.
 */
export class Landing {
  private menu = $('menu');
  private fx = $<HTMLCanvasElement>('lp-fx');
  private raf = 0;

  constructor(private chars: CharacterDef[], private weapons: WeaponDef[], private onPick: (def: CharacterDef) => void) {
    for (const b of this.menu.querySelectorAll<HTMLButtonElement>('[data-lang]')) {
      b.onclick = () => setLang(b.dataset.lang as Lang);
    }
    onLang(() => this.render());
    this.menu.addEventListener('pointermove', (e) => {
      this.menu.style.setProperty('--mx', `${e.clientX}px`);
      this.menu.style.setProperty('--my', `${e.clientY}px`);
    });
    this.render();
  }

  /** Sayfa her açıldığında: başlık animasyonu baştan oynar, parçacıklar çalışır. */
  enter() {
    this.menu.scrollTop = 0;
    this.title();
    cancelAnimationFrame(this.raf);
    if (!reduced()) this.embers();
  }

  private render() {
    applyStatic();
    for (const b of this.menu.querySelectorAll<HTMLButtonElement>('[data-lang]')) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === getLang()));
    }
    this.title();
    this.reel();
    this.ticker();
    this.cards();
    this.arsenal();
  }

  /** Dev başlık: harfler alttan yükselir; son kelimenin üstü çizilir, yerine kırmızısı çarpar. */
  private title() {
    const el = $('lp-title');
    let i = 0;
    const chars = (s: string) => [...s].map((c) => `<span class="ch" style="--i:${i++}">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    el.classList.remove('shake');
    el.innerHTML =
      `<span class="ln">${chars(t('hero.l1'))}</span>` +
      `<span class="ln">${chars(t('hero.l2'))}</span>` +
      `<span class="ln"><span class="swap"><span class="old">${chars(t('hero.l3'))}</span><span class="new">${t('hero.fix')}</span></span></span>`;
    el.setAttribute('aria-label', `${t('hero.l1')} ${t('hero.l2')} ${t('hero.fix')}`);
    void el.offsetWidth;
    el.classList.add('shake');
  }

  /** Slotun "gösterdiği" çarpanlar makara gibi döner; yanında ödediği durur. */
  private reel() {
    const values = [25, 100, 500, 1000, 2500, 5000, 12500, 15000, 25000];
    $('lp-reel').innerHTML = values.map((v) => `<span>${fmt(v)}x</span>`).join('');
  }

  private ticker() {
    const items = t('ticker').split(' · ').map((s) => `<span>${s}</span>`).join('');
    $('lp-ticker').innerHTML = items + items; // kesintisiz döngü için iki kopya
  }

  private cards() {
    const io = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io!.unobserve(e.target);
            }
          }
        }, { root: this.menu, threshold: 0.15 })
      : null;

    $('cards').replaceChildren(
      ...this.chars.map((c, i) => {
        const b = document.createElement('button');
        b.className = 'lp-card';
        b.style.setProperty('--i', String(i));
        const name = boss(c.id, 'name', c.name);
        b.innerHTML =
          `<img src="bosses/${c.id}.jpg" alt="${name}" loading="lazy" />` +
          `<span class="no">${String(i + 1).padStart(2, '0')}</span>` +
          `<span class="mw">${fmt(c.maxWin)}x<small>${t('boss.maxwin')}</small></span>` +
          `<span class="txt"><span class="slot">${boss(c.id, 'slot', c.slotName)}</span>` +
          `<span class="name">${name}</span>` +
          `<span class="trick"><span>${boss(c.id, 'trick')}</span></span>` +
          `<span class="go">${t('boss.play')}<i>→</i></span></span>` +
          `<span class="hp"></span>`;
        b.onclick = () => this.onPick(c);
        // İmlece göre eğilme ve paralaks.
        b.onpointermove = (e) => {
          if (e.pointerType === 'touch' || reduced()) return;
          const r = b.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * 2 - 1, py = ((e.clientY - r.top) / r.height) * 2 - 1;
          b.style.setProperty('--px', px.toFixed(3));
          b.style.setProperty('--py', py.toFixed(3));
          b.style.setProperty('--ry', `${(px * 9).toFixed(2)}deg`);
          b.style.setProperty('--rx', `${(-py * 7).toFixed(2)}deg`);
        };
        b.onpointerleave = () => {
          for (const v of ['--px', '--py', '--rx', '--ry']) b.style.removeProperty(v);
        };
        io?.observe(b);
        return b;
      }),
    );
  }

  private arsenal() {
    $('lp-arsenal').innerHTML = this.weapons
      .map((w) => `<li><b>${t(`w.${w.id}` as Key)}</b><span>${t(`wd.${w.id}` as Key)}</span></li>`)
      .join('');
  }

  /** Arka plan: karanlıkta yükselen kor parçacıkları (çoğu kemik rengi, birkaçı kırmızı). */
  private embers() {
    const c = this.fx, ctx = c.getContext('2d')!;
    const ps = Array.from({ length: 70 }, () => ({
      x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8,
      v: 0.012 + Math.random() * 0.03, w: Math.random() * 6.28, red: Math.random() < 0.22,
    }));
    let last = performance.now();
    const tick = (now: number) => {
      this.raf = requestAnimationFrame(tick);
      if (this.menu.hidden) return; // oyun oynanırken çizme
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = c.clientWidth, h = c.clientHeight;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y -= p.v * dt;
        p.w += dt * 1.3;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
        }
        const x = (p.x + Math.sin(p.w) * 0.008) * w, y = p.y * h;
        ctx.globalAlpha = 0.15 + 0.5 * Math.abs(Math.sin(p.w * 0.7));
        ctx.fillStyle = p.red ? '#c8102e' : '#ece6d6';
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, 6.28);
        ctx.fill();
      }
    };
    this.raf = requestAnimationFrame(tick);
  }
}
