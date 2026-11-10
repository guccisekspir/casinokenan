import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { WeaponDef } from './weapons';

/**
 * Oyuncunun elleri ve elindeki silah (birinci şahıs).
 *
 *  - Oyuncu kendi gözünden oynarken (POV) eller hep kadrajdadır: nefesle ve adımla salınır,
 *    nişana doğru hafifçe kayar.
 *  - Sinema planlarında eller kadrajda durmaz; yalnızca vururken alttan girip çıkar.
 *
 * Yumruk ve muşta iki ayrı eldir ve sırayla vurur. Tabanca, katana ve ışın kılıcı iki elle
 * tutulan tek bir gruptur. Parçaların "ileri" yönü +Z'dir (`lookAt` +Z'yi hedefe çevirir).
 */
const SKIN = new THREE.MeshStandardMaterial({ color: 0xc27a4e, roughness: 0.72 });
const WRAP = new THREE.MeshStandardMaterial({ color: 0xa8a294, roughness: 0.95 });
const STEEL = new THREE.MeshStandardMaterial({ color: 0xe6ebf2, roughness: 0.3, metalness: 0.35 });
const GUNMETAL = new THREE.MeshStandardMaterial({ color: 0x3a3c46, roughness: 0.45, metalness: 0.3 });
const DARK = new THREE.MeshStandardMaterial({ color: 0x2a2a31, roughness: 0.8 });
const GOLD = new THREE.MeshStandardMaterial({ color: 0xf2c230, roughness: 0.35, metalness: 0.4 });

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const smooth = (x: number) => x * x * (3 - 2 * x);

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.frustumCulled = false;
  return m;
}

const SKIN_DARK = new THREE.MeshStandardMaterial({ color: 0x9c5c3a, roughness: 0.75 });

/** Kıvrık bir parmak: üç boğum, eklem yerlerinde yuvarlak. `curl` her boğumun bükülme açısı. */
function finger(len: number, r: number, curl: [number, number, number]): THREE.Group {
  const root = new THREE.Group();
  let parent: THREE.Object3D = root;
  const seg = [len * 0.44, len * 0.31, len * 0.25];
  for (let i = 0; i < 3; i++) {
    const j = new THREE.Group();
    j.rotation.x = curl[i];
    const rr = r * (1 - i * 0.09);
    j.add(mesh(new THREE.CapsuleGeometry(rr, seg[i], 3, 8).rotateX(Math.PI / 2), SKIN, 0, 0, seg[i] / 2));
    if (i < 2) {
      const next = new THREE.Group();
      next.position.z = seg[i];
      j.add(next);
      parent.add(j);
      parent = next;
    } else parent.add(j);
  }
  return root;
}

/**
 * Yumruk yapılmış el + ön kol. Orijin elin ortası, parmak eklemleri +Z'ye bakar.
 * @param side +1 sağ el, -1 sol el
 * @param pitch, yaw ön kolun bilekten kırılma açısı (silah tutuşları için)
 */
function arm(side: number, pitch = 0.3, yaw = 0.2): THREE.Group {
  const g = new THREE.Group();
  // Avuç: arkası hafif bombeli, bileğe doğru daralan bir blok.
  const palm = mesh(new RoundedBoxGeometry(0.096, 0.05, 0.1, 4, 0.02), SKIN, 0, 0.012, -0.004);
  g.add(palm);
  g.add(mesh(new THREE.SphereGeometry(0.05, 14, 10).scale(0.98, 0.42, 1.02), SKIN, 0, 0.03, -0.006)); // el sırtı
  g.add(mesh(new THREE.SphereGeometry(0.034, 12, 8).scale(1, 0.8, 1.2), SKIN, -0.03 * side, -0.014, -0.012)); // başparmak yastığı

  // Dört parmak: eklem kemikleri sırtta bir sıra tümsek; parmaklar avuca kıvrılır.
  const lens = [0.07, 0.078, 0.074, 0.062], rad = [0.0118, 0.0124, 0.0118, 0.0105];
  for (let i = 0; i < 4; i++) {
    const x = (-0.035 + i * 0.0235) * side;
    const f = finger(lens[i], rad[i], [1.25, 1.55, 1.2]);
    f.position.set(x, 0.03 - Math.abs(i - 1.5) * 0.0022, 0.042 - Math.abs(i - 1.3) * 0.004);
    f.rotation.y = (i - 1.5) * -0.05 * side;
    g.add(f);
    g.add(mesh(new THREE.SphereGeometry(rad[i] * 1.12, 10, 8), SKIN_DARK, x, 0.033 - Math.abs(i - 1.5) * 0.0022, 0.045 - Math.abs(i - 1.3) * 0.004));
  }
  // Başparmak: işaret ve orta parmağın üstüne çapraz kapanır.
  const thumb = finger(0.075, 0.0138, [0.15, 0.55, 0.5]);
  thumb.position.set(-0.05 * side, -0.004, 0.012);
  thumb.rotation.set(0.5, 0.95 * side, -0.2 * side);
  g.add(thumb);

  // Ön kol: bilekten kas göbeğine kalınlaşıp dirseğe doğru yeniden incelir.
  const fore = new THREE.Group();
  fore.position.set(0, 0.004, -0.05);
  fore.rotation.set(-pitch, -yaw * side, 0); // + pitch: dirsek aşağı, + yaw: dirsek dışarı
  // (bilek -> kas göbeği -> dirsek; üst üste üç konik parça)
  const taper: [number, number, number][] = [[0.036, 0.047, 0.14], [0.047, 0.056, 0.14], [0.056, 0.048, 0.14]];
  let z = 0;
  for (const [r0, r1, len] of taper) {
    fore.add(mesh(new THREE.CylinderGeometry(r1, r0, len, 18, 1, true).rotateX(Math.PI / 2).scale(1.08, 0.9, 1), SKIN, 0, 0, z - len / 2));
    z -= len;
  }
  // Bilek ve el sırtı sargısı: üst üste binen bantlar.
  for (let i = 0; i < 4; i++) {
    const band = mesh(new THREE.CylinderGeometry(0.0395 + i * 0.0012, 0.0385 + i * 0.0012, 0.026, 16).rotateX(Math.PI / 2).scale(1.08, 0.9, 1), WRAP, 0, 0, -0.012 - i * 0.022);
    band.rotation.z = (i % 2 ? 0.12 : -0.1);
    fore.add(band);
  }
  g.add(fore);
  const strap = mesh(new THREE.TorusGeometry(0.05, 0.0075, 6, 20).scale(1.02, 0.62, 1).rotateX(Math.PI / 2), WRAP, 0, 0.012, 0.004);
  strap.rotation.z = 0.14 * side;
  g.add(strap);
  return g;
}

function knuckleDuster(side: number): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    g.add(mesh(new THREE.TorusGeometry(0.0155, 0.0065, 8, 14), GOLD, (-0.035 + i * 0.0235) * side, 0.012, 0.062));
  }
  g.add(mesh(new RoundedBoxGeometry(0.104, 0.022, 0.02, 2, 0.006), GOLD, 0, 0.012, 0.074));
  return g;
}

function pistol(): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(new RoundedBoxGeometry(0.03, 0.04, 0.2, 2, 0.006), GUNMETAL, 0, 0.062, 0.07)); // sürgü
  g.add(mesh(new THREE.BoxGeometry(0.026, 0.022, 0.15), DARK, 0, 0.034, 0.06)); // gövde
  g.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 10).rotateX(Math.PI / 2), DARK, 0, 0.064, 0.178)); // namlu ağzı
  const grip = mesh(new RoundedBoxGeometry(0.028, 0.11, 0.046, 2, 0.006), DARK, 0, -0.02, -0.012);
  grip.rotation.x = 0.22;
  g.add(grip);
  const guard = mesh(new THREE.TorusGeometry(0.02, 0.004, 6, 12, Math.PI), DARK, 0, 0.022, 0.045);
  guard.rotation.set(0, Math.PI / 2, Math.PI);
  g.add(guard);
  g.add(mesh(new THREE.BoxGeometry(0.006, 0.01, 0.008), STEEL, 0, 0.086, 0.16)); // arpacık
  const flash = mesh(
    new THREE.SphereGeometry(0.06, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xffd060, transparent: true, opacity: 0.95 }),
    0, 0.064, 0.24,
  );
  flash.name = 'flash';
  flash.scale.set(1, 1, 2.2);
  flash.visible = false;
  g.add(flash);
  return g;
}

const SAW_BODY = new THREE.MeshStandardMaterial({ color: 0xe0531f, roughness: 0.5 });

/** Motorlu testere. Orijin ön tutamak; pala +Z'ye uzanır. Zincir `chain` adlı parçadır. */
function chainsaw(): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(new RoundedBoxGeometry(0.15, 0.13, 0.24, 3, 0.025), SAW_BODY, 0, 0, -0.06)); // motor
  g.add(mesh(new RoundedBoxGeometry(0.11, 0.05, 0.1, 2, 0.015), DARK, 0, 0.085, -0.08)); // hava filtresi
  g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 10), GUNMETAL, 0.05, 0.08, 0.02)); // egzoz
  // Arka tutamak ve üstten dolanan ön tutamak
  g.add(mesh(new THREE.TorusGeometry(0.055, 0.013, 8, 14, Math.PI).rotateY(Math.PI / 2).rotateX(-Math.PI / 2), DARK, 0, 0.0, -0.2));
  g.add(mesh(new THREE.TorusGeometry(0.095, 0.011, 8, 16, Math.PI).rotateZ(0), DARK, 0, 0.02, 0.03));
  // Pala + zincir (koyu, dişli kenar)
  g.add(mesh(new RoundedBoxGeometry(0.012, 0.085, 0.62, 2, 0.005), STEEL, 0.03, -0.01, 0.38));
  const chain = new THREE.Group();
  chain.name = 'chain';
  for (let i = 0; i < 22; i++) {
    for (const y of [0.04, -0.06]) {
      chain.add(mesh(new THREE.BoxGeometry(0.016, 0.014, 0.016), GUNMETAL, 0.03, y, 0.09 + i * 0.028));
    }
  }
  chain.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.016, 12, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateX(Math.PI / 2), GUNMETAL, 0.03, -0.01, 0.69));
  g.add(chain);
  return g;
}

function sword(def: WeaponDef): THREE.Group {
  const g = new THREE.Group();
  if (def.cauterize) {
    const color = def.color ?? 0x35e0ff;
    g.add(mesh(new THREE.CylinderGeometry(0.019, 0.021, 0.3, 14).rotateX(Math.PI / 2), STEEL, 0, 0, 0.01));
    g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 14).rotateX(Math.PI / 2), GUNMETAL, 0, 0, 0.16));
    g.add(mesh(new THREE.CapsuleGeometry(0.014, 0.95, 4, 10).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff }), 0, 0, 0.67));
    g.add(mesh(
      new THREE.CapsuleGeometry(0.034, 0.95, 4, 10).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, depthWrite: false }),
      0, 0, 0.67,
    ));
    const light = new THREE.PointLight(color, 5, 4);
    light.position.z = 0.6;
    g.add(light);
  } else {
    g.add(mesh(new THREE.CylinderGeometry(0.017, 0.019, 0.3, 12).rotateX(Math.PI / 2), DARK, 0, 0, 0.01)); // kabza
    g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12).rotateX(Math.PI / 2), GOLD, 0, 0, -0.145));
    g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 16).rotateX(Math.PI / 2), GOLD, 0, 0, 0.165)); // tsuba
    // Namlu: hafif kavisli, uca doğru incelen ince bir yaprak.
    const blade = new THREE.BoxGeometry(0.036, 0.008, 0.98, 1, 1, 20);
    const p = blade.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = p.getZ(i) / 0.98 + 0.5; // 0 kabza, 1 uç
      p.setX(i, p.getX(i) * (1 - 0.6 * t * t * t) - 0.06 * t * t);
      p.setY(i, p.getY(i) * (1 - 0.6 * t));
    }
    blade.computeVertexNormals();
    g.add(mesh(blade, STEEL, 0, 0, 0.66));
  }
  return g;
}

export type PunchStyle = 'jab' | 'hook' | 'upper';

export interface ViewState {
  /** Oyuncu kendi gözünden mi oynuyor. */
  pov: boolean;
  /** Nişan ışını (dünya uzayı). */
  ray: THREE.Ray;
  /** Kesici silahla sürükleme sürüyor mu. */
  holding: boolean;
  /** Yürüme salınımı (-1..1). */
  bob: number;
  /** Testere şu an ete değiyor mu. */
  cutting?: boolean;
}

export class ViewModel {
  private root = new THREE.Group();
  private def: WeaponDef | null = null;
  private left: THREE.Group | null = null;
  private right: THREE.Group | null = null;
  /** Tabanca / kılıç: silah ve onu tutan iki el. */
  private tool: THREE.Group | null = null;
  private flash: THREE.Object3D | null = null;
  private chain: THREE.Object3D | null = null;
  private strikeT = 1;
  private hand: 'L' | 'R' = 'L';
  private style: PunchStyle = 'jab';
  private target = new THREE.Vector3();
  private pov = 0;
  private time = 0;
  private aimX = 0;
  private aimY = 0;

  constructor(private camera: THREE.PerspectiveCamera) {
    camera.add(this.root);
    // Eller karanlık sahnede kaybolmasın: yalnızca yakını aydınlatan zayıf bir ışık.
    const fill = new THREE.PointLight(0xfff0dc, 0.28, 1.6, 1.4);
    fill.position.set(0, 0.25, 0.1);
    this.root.add(fill);
  }

  setWeapon(def: WeaponDef) {
    for (const g of [this.left, this.right, this.tool]) g?.removeFromParent();
    this.left = this.right = this.tool = this.flash = this.chain = null;
    this.def = def;

    if (def.kind === 'blunt') {
      this.left = arm(-1);
      this.right = arm(1);
      if (def.id !== 'fist') {
        this.left.add(knuckleDuster(-1));
        this.right.add(knuckleDuster(1));
      }
      this.root.add(this.left, this.right);
    } else if (def.kind === 'shot') {
      const t = (this.tool = new THREE.Group());
      t.add(pistol());
      // Sağ el kabzada, sol el alttan destekler.
      const r = arm(1, 0.55, 0.5);
      r.position.set(0.004, -0.012, -0.012);
      const l = arm(-1, 0.6, 0.6);
      l.position.set(-0.034, -0.045, 0.0);
      l.rotation.set(0.1, 0.35, 0.4);
      t.add(r, l);
      this.flash = t.getObjectByName('flash') ?? null;
      this.root.add(t);
    } else if (def.kind === 'saw') {
      const t = (this.tool = new THREE.Group());
      t.add(chainsaw());
      this.chain = t.getObjectByName('chain') ?? null;
      // Sağ el arka tutamakta, sol el üstteki ön tutamakta.
      const r = arm(1, 0.5, 0.35);
      r.position.set(0, 0.0, -0.25);
      const l = arm(-1, 0.75, 0.5);
      l.rotation.z = Math.PI / 2;
      l.position.set(-0.08, 0.07, 0.03);
      t.add(r, l);
      this.root.add(t);
    } else {
      const t = (this.tool = new THREE.Group());
      t.add(sword(def));
      // Kabza yumruğun içinden dikine geçer: eklemler yukarı, ön kollar aşağı.
      const r = arm(1, -0.5, 0.3);
      r.rotation.x = -Math.PI / 2;
      r.position.set(0, 0, 0.085);
      const l = arm(-1, -0.5, 0.45);
      l.rotation.x = -Math.PI / 2;
      l.position.set(0, 0, -0.055);
      t.add(r, l);
      this.root.add(t);
    }
    this.root.traverse((o) => {
      o.frustumCulled = false;
    });
  }

  /** Bir vuruş başlatır. Yumruklar sırayla vurur. */
  /** @param style 'jab' hızlı direkt; 'hook' yandan savrulan kroşe; 'upper' alttan gelen aparkat */
  strike(target: THREE.Vector3, style: PunchStyle = 'jab') {
    this.strikeT = 0;
    this.target.copy(target);
    this.style = style;
    this.hand = this.hand === 'L' ? 'R' : 'L';
  }

  update(dt: number, s: ViewState) {
    const def = this.def;
    if (!def) return;
    const cam = this.camera;
    this.time += dt;
    this.pov += ((s.pov ? 1 : 0) - this.pov) * Math.min(1, dt * 7);
    const dur = def.kind === 'blunt' ? (this.style === 'jab' ? 0.26 : 0.4) : def.kind === 'shot' ? 0.2 : 0.3;
    this.strikeT = Math.min(1, this.strikeT + dt / dur);
    const striking = this.strikeT < 1;
    const k = striking ? Math.sin(Math.PI * Math.pow(this.strikeT, 0.55)) : 0;
    const active = striking || s.holding;
    this.root.visible = this.pov > 0.02 || active;
    if (!this.root.visible) return;

    const t = this.time;
    const narrow = cam.aspect < 0.8 ? 0.62 : 1; // dikey ekranda eller içeri gelir
    const hide = (1 - this.pov) * -0.6; // sinema planında dinlenme konumu kadrajın altında
    const swayY = Math.sin(t * 1.9) * 0.006 + s.bob * 0.7;
    const swayX = Math.sin(t * 1.1) * 0.005;
    const aim = cam.worldToLocal(s.ray.at(3.2, _a)); // nişan, kamera uzayında
    // Eller ve silah imleci izler: nereye nişan alırsan oraya kalkar, iner, yana kayar.
    const follow = 1 - Math.exp(-14 * dt);
    this.aimX += (THREE.MathUtils.clamp(aim.x * 0.085, -0.2, 0.2) * narrow - this.aimX) * follow;
    this.aimY += (THREE.MathUtils.clamp(aim.y * 0.11, -0.1, 0.2) - this.aimY) * follow;
    const lagX = this.aimX, lagY = this.aimY;
    // Yumrukların baktığı nokta da imlece döner.
    const guard = (sgn: number) => _a.set(sgn * 0.04 + aim.x * 0.45, 0.3 + aim.y * 0.55, -1.4);
    const toWorld = (v: THREE.Vector3) => cam.localToWorld(v);

    if (def.kind === 'blunt') {
      const tgt = cam.worldToLocal(_b.copy(this.target));
      // Yumruğun evreleri: kurulma (ağır yumrukta), fırlama, hedefte bir an asılı kalma, geri çekme.
      const u = this.strikeT, heavy = this.style !== 'jab';
      const t0 = heavy ? 0.26 : 0.06, t1 = heavy ? 0.42 : 0.3, t2 = heavy ? 0.56 : 0.42;
      const wind = !striking ? 0 : u < t0 ? Math.sin((u / t0) * Math.PI * 0.5) : Math.max(0, 1 - (u - t0) / (t1 - t0));
      const ext = !striking || u < t0 ? 0
        : u < t1 ? 1 - Math.pow(1 - (u - t0) / (t1 - t0), 3)
        : u < t2 ? 1
        : 1 - smooth((u - t2) / (1 - t2));
      for (const [g, sgn, lead] of [[this.left, -1, 0.04], [this.right, 1, 0]] as const) {
        if (!g) continue;
        const mine = striking && (this.hand === 'R') === (sgn === 1);
        g.visible = this.pov > 0.02 || mine;
        const rest = _c.set(sgn * 0.2 * narrow + lagX + swayX, -0.145 + hide + lagY + swayY * (sgn === 1 ? 1 : 0.8), -0.52 - lead);
        if (mine) {
          // Kurulma: direkt geri çekilir, kroşe yana açılır, aparkat aşağı iner.
          const back = this.style === 'hook' ? _a.set(sgn * 0.3, 0.02, 0.2) : this.style === 'upper' ? _a.set(sgn * 0.05, -0.2, 0.16) : _a.set(0, -0.01, 0.1);
          rest.addScaledVector(back, wind);
          // Kendi gözünden oynarken kol boyu sınırlıdır; sinema planında yumruk kadraj dışından gelir.
          const hitAt = _a.copy(tgt).multiplyScalar(0.86);
          if (s.pov && hitAt.length() > 1.25) hitAt.setLength(1.25);
          g.position.copy(rest).lerp(hitAt, ext);
          // Yay: kroşe dışarıdan içeri, aparkat aşağıdan yukarı kavis çizer.
          const arc = Math.sin(ext * Math.PI) * (1 - ext * 0.3);
          if (this.style === 'hook') g.position.x += sgn * 0.26 * arc;
          if (this.style === 'upper') g.position.y -= 0.24 * arc;
          g.lookAt(toWorld(guard(sgn).lerp(tgt, Math.min(1, ext * 1.4 + wind * 0.3))));
          // Bilek: direkt içe döner; kroşede yumruk yatay, aparkatta avuç yukarı bakar.
          g.rotateZ(-sgn * (0.55 - (this.style === 'hook' ? 2.0 : 0.95) * ext));
          if (this.style === 'upper') g.rotateX(-0.9 * ext);
          if (this.style === 'hook') g.rotateY(-sgn * 0.7 * ext);
        } else {
          // Öbür el çeneyi korur: vuruş anında yukarı ve içe toplanır.
          rest.z += 0.06 * ext;
          rest.y += 0.05 * ext;
          rest.x -= sgn * 0.04 * ext;
          g.position.copy(rest);
          g.lookAt(toWorld(guard(sgn)));
          g.rotateZ(-sgn * 0.55);
        }
      }
      // Omuz dönüşü: bütün gövde yumruğun arkasına girer.
      const turn = (this.hand === 'R' ? 1 : -1) * (heavy ? 0.16 : 0.07);
      this.root.rotation.set(0, turn * (ext - wind * 0.6), turn * -0.5 * ext);
      this.root.position.set(0, heavy ? -0.03 * wind : 0, heavy ? 0.06 * wind - 0.05 * ext : -0.02 * ext);
      return;
    }
    this.root.rotation.set(0, 0, 0);
    this.root.position.set(0, 0, 0);

    const g = this.tool!;
    if (def.kind === 'shot') {
      g.position.set(0.11 * narrow + lagX * 1.15 + swayX, -0.15 + hide * 0.7 + lagY * 1.15 + swayY - 0.25 * (1 - this.pov) * (1 - Math.min(1, k * 3)), -0.58 + 0.09 * k);
      g.lookAt(s.ray.at(8, _a));
      g.rotateX(-0.38 * k); // geri tepme
      if (this.flash) this.flash.visible = this.strikeT < 0.3;
      return;
    }

    if (def.kind === 'saw') {
      // Rölantide belde, hafifçe titrer; tetiğe basınca pala imlecin gösterdiği yere uzanır ve
      // ete değdiğinde bütün alet sarsılır.
      const rev = s.holding ? 1 : 0;
      const buzz = (s.cutting ? 0.012 : s.holding ? 0.005 : 0.0018);
      const jx = (Math.random() - 0.5) * buzz, jy = (Math.random() - 0.5) * buzz;
      const rest = _c.set(0.14 * narrow + lagX + swayX + jx, -0.21 + hide + lagY + swayY + jy, -0.5);
      const hold = cam.worldToLocal(s.ray.at(1.25, _b));
      // Gövde imlecin sağ altında kalır, pala çaprazdan imlece uzanır: kesilen yer ve dişler görünür.
      hold.y -= 0.3;
      hold.x += 0.24 * narrow;
      hold.z += 0.5;
      rest.lerp(hold, rev);
      g.position.lerp(rest, 1 - Math.exp(-20 * dt));
      g.lookAt(s.ray.at(3.2 - 1.7 * rev, _a));
      g.rotateX(-0.3 * (1 - rev) + (s.cutting ? (Math.random() - 0.5) * 0.05 : 0));
      g.rotateZ(0.12 * (1 - rev));
      // Zincir dönüyor izlenimi: dişler pala boyunca ileri geri kayar.
      if (this.chain) this.chain.position.z = s.holding ? (t * 3) % 0.028 : 0;
      return;
    }

    // Kesici: dinlenirken sağ altta çapraz durur; sürüklerken imlecin altına gelir.
    const rest = _c.set(0.17 * narrow + lagX + swayX, -0.2 + hide + lagY + swayY, -0.6);
    const hold = cam.worldToLocal(s.ray.at(1.5, _b));
    hold.y -= 0.42;
    hold.x += 0.08;
    const f = s.holding ? 1 : k;
    rest.lerp(hold, f);
    g.position.lerp(rest, 1 - Math.exp(-26 * dt));
    g.lookAt(s.ray.at(3.2, _a));
    g.rotateX(-1.15 + 1.0 * k);
    g.rotateZ(0.42 * (1 - f));
  }
}
