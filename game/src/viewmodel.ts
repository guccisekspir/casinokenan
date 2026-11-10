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
const SKIN = new THREE.MeshStandardMaterial({ color: 0xd9a37c, roughness: 0.62 });
const WRAP = new THREE.MeshStandardMaterial({ color: 0xe9e4d8, roughness: 0.9 });
const STEEL = new THREE.MeshStandardMaterial({ color: 0xe6ebf2, roughness: 0.3, metalness: 0.35 });
const GUNMETAL = new THREE.MeshStandardMaterial({ color: 0x3a3c46, roughness: 0.45, metalness: 0.3 });
const DARK = new THREE.MeshStandardMaterial({ color: 0x2a2a31, roughness: 0.8 });
const GOLD = new THREE.MeshStandardMaterial({ color: 0xf2c230, roughness: 0.35, metalness: 0.4 });

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.frustumCulled = false;
  return m;
}

/**
 * Yumruk yapılmış el + ön kol. Orijin elin ortası, parmak eklemleri +Z'ye bakar.
 * @param side +1 sağ el, -1 sol el
 * @param pitch, yaw ön kolun bilekten kırılma açısı (silah tutuşları için)
 */
function arm(side: number, pitch = 0.3, yaw = 0.2): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(new RoundedBoxGeometry(0.1, 0.086, 0.1, 3, 0.022), SKIN));
  // Dört parmak: üstte bir boğum, önde aşağı kıvrılan ikinci boğum.
  for (let i = 0; i < 4; i++) {
    const x = (-0.036 + i * 0.024) * side;
    const len = i === 0 || i === 3 ? 0.03 : 0.036;
    g.add(mesh(new THREE.CapsuleGeometry(0.0125, len, 3, 8).rotateX(Math.PI / 2), SKIN, x, 0.031, 0.04));
    g.add(mesh(new THREE.CapsuleGeometry(0.012, 0.034, 3, 8), SKIN, x, 0.004, 0.063));
  }
  // Başparmak: parmakların önünde çapraz.
  const thumb = mesh(new THREE.CapsuleGeometry(0.0135, 0.05, 3, 8).rotateZ(Math.PI / 2), SKIN, -0.012 * side, -0.027, 0.062);
  thumb.rotation.y = 0.35 * side;
  g.add(thumb);
  g.add(mesh(new THREE.SphereGeometry(0.02, 8, 6), SKIN, -0.05 * side, -0.012, 0.03));

  // Ön kol: bilekten dirseğe kalınlaşır; bilekte sargı.
  const fore = new THREE.Group();
  fore.position.set(0, -0.004, -0.045);
  fore.rotation.set(-pitch, -yaw * side, 0); // + pitch: dirsek aşağı, + yaw: dirsek dışarı
  fore.add(mesh(new THREE.CylinderGeometry(0.056, 0.04, 0.36, 14).rotateX(Math.PI / 2), SKIN, 0, 0, -0.19));
  fore.add(mesh(new THREE.CylinderGeometry(0.044, 0.042, 0.07, 14).rotateX(Math.PI / 2), WRAP, 0, 0, -0.045));
  fore.add(mesh(new THREE.SphereGeometry(0.041, 10, 8), SKIN));
  g.add(fore);
  return g;
}

function knuckleDuster(side: number): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    g.add(mesh(new THREE.TorusGeometry(0.0155, 0.006, 8, 14), GOLD, (-0.036 + i * 0.024) * side, 0.02, 0.075));
  }
  g.add(mesh(new RoundedBoxGeometry(0.104, 0.02, 0.018, 2, 0.006), GOLD, 0, 0.0, 0.082));
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

export interface ViewState {
  /** Oyuncu kendi gözünden mi oynuyor. */
  pov: boolean;
  /** Nişan ışını (dünya uzayı). */
  ray: THREE.Ray;
  /** Kesici silahla sürükleme sürüyor mu. */
  holding: boolean;
  /** Yürüme salınımı (-1..1). */
  bob: number;
}

export class ViewModel {
  private root = new THREE.Group();
  private def: WeaponDef | null = null;
  private left: THREE.Group | null = null;
  private right: THREE.Group | null = null;
  /** Tabanca / kılıç: silah ve onu tutan iki el. */
  private tool: THREE.Group | null = null;
  private flash: THREE.Object3D | null = null;
  private strikeT = 1;
  private hand: 'L' | 'R' = 'L';
  private target = new THREE.Vector3();
  private pov = 0;
  private time = 0;
  private aimX = 0;
  private aimY = 0;

  constructor(private camera: THREE.PerspectiveCamera) {
    camera.add(this.root);
    // Eller karanlık sahnede kaybolmasın: yalnızca yakını aydınlatan zayıf bir ışık.
    const fill = new THREE.PointLight(0xfff0dc, 0.9, 1.6, 1.4);
    fill.position.set(0, 0.25, 0.1);
    this.root.add(fill);
  }

  setWeapon(def: WeaponDef) {
    for (const g of [this.left, this.right, this.tool]) g?.removeFromParent();
    this.left = this.right = this.tool = this.flash = null;
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
  strike(target: THREE.Vector3) {
    this.strikeT = 0;
    this.target.copy(target);
    this.hand = this.hand === 'L' ? 'R' : 'L';
  }

  update(dt: number, s: ViewState) {
    const def = this.def;
    if (!def) return;
    const cam = this.camera;
    this.time += dt;
    this.pov += ((s.pov ? 1 : 0) - this.pov) * Math.min(1, dt * 7);
    const dur = def.kind === 'blunt' ? 0.24 : def.kind === 'shot' ? 0.2 : 0.3;
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
      for (const [g, sgn, lead] of [[this.left, -1, 0.04], [this.right, 1, 0]] as const) {
        if (!g) continue;
        const mine = striking && (this.hand === 'R') === (sgn === 1);
        g.visible = this.pov > 0.02 || mine;
        const rest = _c.set(sgn * 0.2 * narrow + lagX + swayX, -0.145 + hide + lagY + swayY * (sgn === 1 ? 1 : 0.8), -0.52 - lead);
        if (mine) {
          // Vuran el hedefe uzanır, bilek içe döner.
          g.position.copy(rest).lerp(_a.copy(tgt).multiplyScalar(0.84), k);
          g.lookAt(toWorld(guard(sgn).lerp(tgt, Math.min(1, k * 1.6))));
          g.rotateZ(-sgn * (0.55 - 0.9 * k));
        } else {
          // Öbür el gardını alır.
          rest.z += 0.05 * k;
          rest.y += 0.03 * k;
          g.position.copy(rest);
          g.lookAt(toWorld(guard(sgn)));
          g.rotateZ(-sgn * 0.55);
        }
      }
      return;
    }

    const g = this.tool!;
    if (def.kind === 'shot') {
      g.position.set(0.11 * narrow + lagX * 1.15 + swayX, -0.15 + hide * 0.7 + lagY * 1.15 + swayY - 0.25 * (1 - this.pov) * (1 - Math.min(1, k * 3)), -0.58 + 0.09 * k);
      g.lookAt(s.ray.at(8, _a));
      g.rotateX(-0.38 * k); // geri tepme
      if (this.flash) this.flash.visible = this.strikeT < 0.3;
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
