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

/** Darbe halkası: isabet noktasında kameraya dönük, hızla genişleyip sönen parlak bir halka. */
export class Impacts {
  private rings: { mesh: THREE.Mesh; t: number; size: number }[] = [];
  constructor(scene: THREE.Scene) {
    const geo = new THREE.RingGeometry(0.72, 1, 28);
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        color: 0xfff4dc, transparent: true, opacity: 0, depthTest: false, depthWrite: false,
        blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
      }));
      mesh.visible = false;
      mesh.renderOrder = 5;
      mesh.frustumCulled = false;
      scene.add(mesh);
      this.rings.push({ mesh, t: 1, size: 0.3 });
    }
  }

  spawn(point: THREE.Vector3, size: number) {
    const r = this.rings.reduce((a, b) => (b.t > a.t ? b : a)); // en eskisini yeniden kullan
    r.t = 0;
    r.size = size;
    r.mesh.position.copy(point);
    r.mesh.visible = true;
  }

  update(dt: number, camera: THREE.Camera) {
    for (const r of this.rings) {
      if (!r.mesh.visible) continue;
      r.t += dt / 0.22;
      if (r.t >= 1) {
        r.mesh.visible = false;
        continue;
      }
      const e = 1 - Math.pow(1 - r.t, 3);
      r.mesh.scale.setScalar(r.size * (0.25 + 0.75 * e));
      (r.mesh.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - r.t);
      r.mesh.quaternion.copy(camera.quaternion);
    }
  }
}

/** Yerdeki çatlak: tokadın çaktığı yerde kalan krater ve ışınsal çatlaklar. */
export class Crater {
  private mesh: THREE.Mesh;
  private t = 99;
  constructor(scene: THREE.Scene) {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(256, 256, 20, 256, 256, 250);
    grad.addColorStop(0, 'rgba(0,0,0,0.95)');
    grad.addColorStop(0.3, 'rgba(0,0,0,0.75)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
    g.strokeStyle = 'rgba(0,0,0,0.95)';
    g.lineCap = 'round';
    for (let i = 0; i < 18; i++) {
      // Kırık kırık ilerleyen, uca doğru incelen çatlaklar.
      let a = (i / 18) * Math.PI * 2 + Math.random() * 0.25, r = 34, x = 256 + Math.cos(a) * r, y = 256 + Math.sin(a) * r;
      const len = 120 + Math.random() * 120;
      while (r < len) {
        const step = 14 + Math.random() * 22;
        a += (Math.random() - 0.5) * 0.7;
        r += step;
        g.lineWidth = Math.max(1, 7 * (1 - r / len));
        g.beginPath();
        g.moveTo(x, y);
        x += Math.cos(a) * step;
        y += Math.sin(a) * step;
        g.lineTo(x, y);
        g.stroke();
      }
    }
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, opacity: 0 }),
    );
    this.mesh.visible = false;
    this.mesh.renderOrder = 1;
    scene.add(this.mesh);
  }

  spawn(x: number, z: number, size: number) {
    this.t = 0;
    this.mesh.position.set(x, 0.012, z);
    this.mesh.rotation.y = Math.random() * 6.28;
    this.mesh.scale.setScalar(size);
    this.mesh.visible = true;
  }

  update(dt: number) {
    if (!this.mesh.visible) return;
    this.t += dt;
    const o = this.t < 9 ? 1 : Math.max(0, 1 - (this.t - 9) / 3); // bir süre kalır, sonra silinir
    (this.mesh.material as THREE.MeshBasicMaterial).opacity = o;
    if (o <= 0) this.mesh.visible = false;
  }

  clear() {
    this.mesh.visible = false;
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
  private bars = 0;
  private badge = '';
  private mode = '';

  constructor() {
    this.canvas.width = 1024;
    this.canvas.height = 640;
    this.tex = new THREE.CanvasTexture(this.canvas);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4), new THREE.MeshBasicMaterial({ map: this.tex }));
  }

  setTheme(symbols: string[], theme: { bg: string; accent: string }, badge = '', mode = '') {
    this.badge = badge;
    this.mode = mode;
    this.symbols = symbols;
    this.theme = theme;
    this.draw(true);
  }

  spin() {
    this.spinT = 0.9;
  }

  /** Karakterin şu an "verdiği" çarpan: ekranın ortasında kocaman yazar. */
  /** @param bars metnin önüne çekilen parmaklık sayısı (0 = açık). */
  setOffer(text: string, bars = 0) {
    if (text === this.offer && bars === this.bars) return;
    this.offer = text;
    this.bars = bars;
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
    // Balık düzeni: ya göl değerli balıklarla dolu ve balıkçı yok, ya da balıkçı gelmiş ama
    // ortada tek bir 2x'lik balık var.
    const fish = this.mode === 'fish';
    const lonely = fish && final && Math.random() < 0.4;
    const lonelyAt = Math.random() < 0.5 ? 0 : 4;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const px = 40 + x * cw, py = 40 + y * ch;
        c.fillStyle = 'rgba(0,0,0,0.35)';
        c.fillRect(px + 6, py + 6, cw - 12, ch - 12);
        let s = this.symbols[1 + Math.floor(Math.random() * (this.symbols.length - 1))];
        if (final && y === 1 && (x === 0 || x === 2) && !fish) s = scatter;
        if (fish) {
          const filler = this.symbols[2 + Math.floor(Math.random() * (this.symbols.length - 2))];
          let value = '';
          if (!final) s = Math.random() < 0.5 ? this.symbols[1] : Math.random() < 0.3 ? scatter : filler;
          else if (lonely) {
            // Balıkçı geldi (üst ve alt sırada); toplayacağı tek balık 2x.
            s = x === lonelyAt && y === 2 ? this.symbols[1] : (x === 1 || x === 3) && y !== 1 ? scatter : filler;
            if (x === lonelyAt && y === 2) value = '2x';
          } else {
            s = (x + y) % 2 === 0 || y === 2 ? this.symbols[1] : filler;
            if (s === this.symbols[1]) value = `${[10, 25, 50, 100, 250][Math.floor(Math.random() * 5)]}x`;
          }
          c.fillStyle = '#fff';
          c.fillText(s, px + cw / 2, py + ch / 2 + (value ? -8 : 4));
          if (value) {
            c.fillStyle = '#ffcf33';
            c.font = `bold ${Math.floor(ch * 0.26)}px Georgia, 'Times New Roman', serif`;
            c.fillText(value, px + cw / 2, py + ch * 0.82);
            c.font = `${Math.floor(ch * 0.6)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
          }
          continue;
        }
        // Vaat edilen sembol: dönerken beş sütunda da geçer; durunca üç tane kalır, zikzak dizilir
        // (alt-üst-alt) ve hiçbir hatta yan yana gelmez.
        const badge = this.badge && (final ? x % 2 === 0 && y === (x === 2 ? 0 : 2) : Math.random() < 0.3);
        if (badge) {
          c.fillStyle = '#b3122b';
          c.beginPath();
          c.arc(px + cw / 2, py + ch / 2, ch * 0.36, 0, Math.PI * 2);
          c.fill();
          c.strokeStyle = '#ffcf33';
          c.lineWidth = 8;
          c.stroke();
          c.fillStyle = '#ffcf33';
          c.font = `bold ${Math.floor(ch * 0.34)}px Georgia, 'Times New Roman', serif`;
          c.fillText(this.badge, px + cw / 2, py + ch / 2 + 4);
          c.font = `${Math.floor(ch * 0.6)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
          continue;
        }
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
        if (this.bars > 0) {
          // Parmaklık: her set bir kat daha sık demir ve bir kilit.
          c.fillStyle = '#8a8f99';
          const n = 4 + this.bars * 3;
          for (let i = 0; i <= n; i++) c.fillRect(cx - W * 0.19 + (W * 0.38 * i) / n - 5, H * 0.36, 10, H * 0.28);
          c.fillRect(cx - W * 0.19, H * 0.36, W * 0.38, 12);
          c.fillRect(cx - W * 0.19, H * 0.64 - 12, W * 0.38, 12);
          c.font = `${Math.floor(H * 0.09)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
          for (let i = 0; i < this.bars; i++) c.fillText('🔒', cx + (i - (this.bars - 1) / 2) * W * 0.07, H * 0.6);
          c.font = `${Math.floor(H * 0.2)}px Georgia, 'Times New Roman', serif`;
        }
      }
    }
    this.tex.needsUpdate = true;
  }
}
