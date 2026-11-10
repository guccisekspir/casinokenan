import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

/**
 * Filmin "banyosu": görüntü siyah-beyaza çekilir, yalnızca doygun sıcak renkler
 * (kan, altın, karakterin vurgu rengi) renkli kalır. Üstüne gren, vinyet ve hafif renk sapması.
 */
const Grade = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uSat: { value: 0.06 },
    uFlash: { value: 0 },
    uFade: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime, uSat, uFlash, uFade;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 d = vUv - 0.5;
      float r2 = dot(d, d);
      vec3 c;
      c.r = texture2D(tDiffuse, vUv + d * r2 * 0.014).r;
      c.g = texture2D(tDiffuse, vUv).g;
      c.b = texture2D(tDiffuse, vUv - d * r2 * 0.014).b;

      float l = dot(c, vec3(0.299, 0.587, 0.114));
      float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
      // Seçici renk: kırmızının baskın olduğu (kırmızı / altın / pembe) doygun pikseller.
      float warm = smoothstep(0.26, 0.46, mx - mn) * smoothstep(-0.02, 0.04, c.r - max(c.g, c.b));
      vec3 bw = vec3(l) * vec3(0.97, 1.0, 1.05);           // soğuk gümüş ton
      c = mix(bw, c, mix(uSat, 1.0, warm));

      c = (c - 0.5) * 1.12 + 0.5;                            // kontrast
      c *= 1.0 - r2 * 1.5;                                   // vinyet
      float g = hash(vUv * vec2(1920.0, 1080.0) + fract(uTime) * 100.0) - 0.5;
      c += g * 0.085 * (1.0 - l * 0.5);                      // gren (gölgelerde daha belirgin)
      c += uFlash;
      c *= 1.0 - uFade;
      gl_FragColor = vec4(max(c, 0.0), 1.0);
    }`,
};

export class Film {
  private composer: EffectComposer;
  private grade: ShaderPass;
  /** Darbe anında kısa beyaz parlama. */
  flash = 0;
  /** 0..1 kararma. */
  fade = 0;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));
    this.composer.addPass(new OutputPass());
    this.grade = new ShaderPass(Grade);
    this.composer.addPass(this.grade);
  }

  setSize(w: number, h: number, pixelRatio: number) {
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(w, h);
  }

  render(dt: number) {
    const u = this.grade.uniforms;
    u.uTime.value += dt;
    this.flash *= Math.exp(-14 * dt);
    u.uFlash.value = this.flash;
    u.uFade.value = this.fade;
    this.composer.render(dt);
  }
}
