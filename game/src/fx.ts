import * as THREE from 'three';
import type { Ragdoll } from './character/ragdoll';

const GRAVITY = 9.8;

/** Kan / kıvılcım için havuzlanmış parçacıklar. */
export class Particles {
  private pos: Float32Array;
  private col: Float32Array;
  private vel: Float32Array;
  private life: Float32Array;
  private next = 0;
  private points: THREE.Points;

  constructor(scene: THREE.Scene, private max = 900) {
    this.pos = new Float32Array(max * 3).fill(-999);
    this.col = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.points = new THREE.Points(
      g,
      new THREE.PointsMaterial({ size: 0.055, vertexColors: true, sizeAttenuation: true }),
    );
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  emit(p: THREE.Vector3, dir: THREE.Vector3, count: number, color: number, speed = 3, spread = 0.6) {
    const c = new THREE.Color(color);
    for (let n = 0; n < count; n++) {
      const i = this.next;
      this.next = (this.next + 1) % this.max;
      const s = speed * (0.3 + Math.random() * 0.9);
      this.pos.set([p.x, p.y, p.z], i * 3);
      this.vel.set(
        [
          (dir.x + (Math.random() - 0.5) * 2 * spread) * s,
          (dir.y + (Math.random() - 0.5) * 2 * spread) * s + 1,
          (dir.z + (Math.random() - 0.5) * 2 * spread) * s,
        ],
        i * 3,
      );
      const shade = 0.7 + Math.random() * 0.3;
      this.col.set([c.r * shade, c.g * shade, c.b * shade], i * 3);
      this.life[i] = 0.8 + Math.random() * 0.9;
    }
  }

  update(dt: number) {
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      const k = i * 3;
      if (this.life[i] <= 0) {
        this.pos[k + 1] = -999;
        continue;
      }
      this.vel[k + 1] -= GRAVITY * dt;
      this.pos[k] += this.vel[k] * dt;
      this.pos[k + 1] += this.vel[k + 1] * dt;
      this.pos[k + 2] += this.vel[k + 2] * dt;
      if (this.pos[k + 1] < 0.02) {
        // yere yapış
        this.pos[k + 1] = 0.02;
        this.vel[k] = this.vel[k + 1] = this.vel[k + 2] = 0;
      }
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
  }

  clear() {
    this.life.fill(0);
    this.pos.fill(-999);
  }
}

interface Gib {
  obj: THREE.Object3D;
  ragdoll: Ragdoll;
}

/** Kopan uzuvlar: her biri kendi ragdoll'uyla düşer, bükülür, yere serilir. */
export class Gibs {
  private list: Gib[] = [];
  /** Bu karede bir parça yere sertçe çarptı mı (ses için). */
  impact = 0;
  constructor(private scene: THREE.Scene) {}

  add(obj: THREE.Object3D, ragdoll: Ragdoll) {
    this.scene.add(obj);
    this.list.push({ obj, ragdoll });
    if (this.list.length > 14) this.remove(this.list.shift()!);
  }

  update(dt: number) {
    this.impact = 0;
    for (const g of this.list) {
      g.ragdoll.step(dt);
      g.ragdoll.apply();
      this.impact = Math.max(this.impact, g.ragdoll.impact);
    }
  }

  clear() {
    this.list.forEach((g) => this.remove(g));
    this.list = [];
  }

  private remove(g: Gib) {
    // Köşe tamponları karakterin mesh'iyle ortak: geometriyi serbest bırakma, yalnızca sahneden çıkar.
    g.obj.removeFromParent();
  }
}


/** Karakterin arkasındaki slot makarası: sürekli "az kalsın" durur. */
export class Reels {
  readonly mesh: THREE.Mesh;
  private canvas = document.createElement('canvas');
  private tex: THREE.CanvasTexture;
  private spinT = 0;
  private tick = 0;
  private symbols: string[] = ['7'];
  private theme = { bg: '#222', accent: '#fc0' };
  private offer = '';

  constructor() {
    this.canvas.width = 1024;
    this.canvas.height = 640;
    this.tex = new THREE.CanvasTexture(this.canvas);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4), new THREE.MeshBasicMaterial({ map: this.tex }));
  }

  setTheme(symbols: string[], theme: { bg: string; accent: string }) {
    this.symbols = symbols;
    this.theme = theme;
    this.draw(true);
  }

  spin() {
    this.spinT = 0.9;
  }

  /** Karakterin şu an "verdiği" çarpan: ekranın ortasında kocaman yazar. */
  setOffer(text: string) {
    if (text === this.offer) return;
    this.offer = text;
    if (this.spinT <= 0) this.draw(true);
  }

  update(dt: number) {
    if (this.spinT <= 0) return;
    this.spinT -= dt;
    this.tick -= dt;
    if (this.spinT <= 0) this.draw(true);
    else if (this.tick <= 0) {
      this.tick = 0.07;
      this.draw(false);
    }
  }

  private draw(final: boolean) {
    const c = this.canvas.getContext('2d')!;
    const W = this.canvas.width, H = this.canvas.height;
    c.fillStyle = this.theme.bg;
    c.fillRect(0, 0, W, H);
    c.strokeStyle = this.theme.accent;
    c.lineWidth = 14;
    c.strokeRect(7, 7, W - 14, H - 14);
    const cols = 5, rows = 3, cw = (W - 80) / cols, ch = (H - 80) / rows;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = `${Math.floor(ch * 0.6)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    // "Az kalsın": son durumda hep iki scatter, üçüncüsü bir sıra yukarıda kalmış.
    const scatter = this.symbols[0];
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const px = 40 + x * cw, py = 40 + y * ch;
        c.fillStyle = 'rgba(0,0,0,0.35)';
        c.fillRect(px + 6, py + 6, cw - 12, ch - 12);
        let s = this.symbols[1 + Math.floor(Math.random() * (this.symbols.length - 1))];
        if (final && y === 1 && (x === 0 || x === 2)) s = scatter;
        c.fillStyle = '#fff';
        c.fillText(s, px + cw / 2, py + ch / 2 + 4);
      }
    }
    if (this.offer) {
      // Karakter ortada durduğu için çarpan iki yana yazılır.
      c.font = `${Math.floor(H * 0.2)}px Georgia, 'Times New Roman', serif`;
      for (const cx of [W * 0.2, W * 0.8]) {
        c.fillStyle = 'rgba(0,0,0,0.82)';
        c.fillRect(cx - W * 0.19, H * 0.36, W * 0.38, H * 0.28);
        c.fillStyle = '#ffcf33';
        c.fillText(this.offer, cx, H / 2 + 6, W * 0.34);
      }
    }
    this.tex.needsUpdate = true;
  }
}
