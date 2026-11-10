/**
 * Max win kutlaması: ekranın tepesinden iri altın paralar yağar (slotlardaki gibi).
 * Sahnenin ve bitiş kartının üstünde, 2B bir tuvalde çizilir; tıklamaları engellemez.
 */
interface Coin {
  x: number; y: number; vx: number; vy: number; r: number; spin: number; w: number; tilt: number;
}

export class CoinRain {
  private ctx: CanvasRenderingContext2D;
  private coins: Coin[] = [];
  private raf = 0;
  private until = 0;
  private last = 0;
  private spawnDebt = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
  }

  /** @param seconds yağışın süresi; ilk anda bir patlama, sonra sürekli akış */
  start(seconds: number) {
    this.stop();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.canvas.hidden = false;
    this.until = performance.now() + seconds * 1000;
    this.last = performance.now();
    for (let i = 0; i < 46; i++) this.spawn(true);
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.coins = [];
    this.canvas.hidden = true;
  }

  private spawn(burst: boolean) {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    const big = Math.random() < 0.22;
    const r = (big ? 46 + Math.random() * 44 : 16 + Math.random() * 22) * Math.min(1, Math.max(0.6, w / 900));
    this.coins.push({
      x: Math.random() * w, y: burst ? -r - Math.random() * h * 0.9 : -r * 2,
      vx: (Math.random() - 0.5) * 120, vy: 180 + Math.random() * 320 + (big ? 120 : 0),
      r, spin: Math.random() * 6.28, w: (3 + Math.random() * 7) * (Math.random() < 0.5 ? -1 : 1), tilt: (Math.random() - 0.5) * 0.9,
    });
  }

  private tick = (now: number) => {
    const c = this.canvas, g = this.ctx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (now < this.until) {
      this.spawnDebt += dt * 38; // saniyede ~38 para
      while (this.spawnDebt >= 1) {
        this.spawnDebt--;
        this.spawn(false);
      }
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    this.coins = this.coins.filter((k) => k.y - k.r < h + 10);
    // Küçükler arkada, büyükler önde.
    this.coins.sort((a, b) => a.r - b.r);
    for (const k of this.coins) {
      k.vy += 520 * dt;
      k.x += k.vx * dt;
      k.y += k.vy * dt;
      k.spin += k.w * dt;
      this.draw(k);
    }
    if (this.coins.length || now < this.until) this.raf = requestAnimationFrame(this.tick);
    else this.stop();
  };

  /** Dönen para: kenardan bakınca incelir; yüzünde halka ve "x". */
  private draw(k: Coin) {
    const g = this.ctx;
    const face = Math.cos(k.spin), sx = Math.max(0.08, Math.abs(face));
    g.save();
    g.translate(k.x, k.y);
    g.rotate(k.tilt);
    // Kalınlık: dönerken görünen yan yüz.
    g.fillStyle = '#8a5a12';
    g.beginPath();
    g.ellipse(k.r * 0.09 * Math.sign(face || 1), 0, k.r * sx, k.r, 0, 0, 6.2832);
    g.fill();
    const grad = g.createLinearGradient(-k.r, -k.r, k.r, k.r);
    grad.addColorStop(0, '#fff3b0');
    grad.addColorStop(0.35, '#f7c93b');
    grad.addColorStop(0.7, '#d99a1c');
    grad.addColorStop(1, '#f9dc6b');
    g.fillStyle = grad;
    g.beginPath();
    g.ellipse(0, 0, k.r * sx, k.r, 0, 0, 6.2832);
    g.fill();
    g.lineWidth = Math.max(1.5, k.r * 0.07);
    g.strokeStyle = '#a86f12';
    g.beginPath();
    g.ellipse(0, 0, k.r * sx * 0.78, k.r * 0.78, 0, 0, 6.2832);
    g.stroke();
    if (sx > 0.35) {
      g.scale(sx, 1);
      g.fillStyle = '#9a6410';
      g.font = `900 ${Math.round(k.r * 0.95)}px Georgia, 'Times New Roman', serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('x', 0, -k.r * 0.04);
    }
    g.restore();
  }
}
