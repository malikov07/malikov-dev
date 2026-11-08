/**
 * GLSL for the aurora that fills the back of the 3D scene.
 *
 * It lives *inside* the three.js scene rather than on a separate canvas so the
 * glass sculpture has something to refract: three's transmission pass renders
 * every opaque object into a buffer, and the glass samples that buffer. A
 * backdrop on another canvas would be invisible to it and the glass would look
 * like grey plastic.
 *
 * Coordinates come from a UV varying, not `gl_FragCoord`, because the
 * transmission buffer is a different size from the screen — a pixel-based
 * lookup would refract a scaled copy of the aurora.
 */

export const AURORA_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  // Written straight to clip space at the far plane: fills any camera's view,
  // never moves, and sits behind everything else in the scene.
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}
`;

export const AURORA_FRAG = /* glsl */ `
uniform float uTime;
uniform float uScroll;   // 0..1 page progress, eased
uniform float uAspect;
uniform vec2  uMouse;    // -1..1, eased
uniform vec4  uFocus;    // sculpture: xy centre, z radius, w brightness

varying vec2 vUv;

// Palette in sRGB; converted to linear once at the end so three's output
// pipeline can treat it like any other material.
// Midnight blue rather than black: the dark chapters should feel like a lit
// stage, not deep space.
const vec3 C_DEEP  = vec3(0.035, 0.050, 0.130);
const vec3 C_NAVY  = vec3(0.070, 0.135, 0.330);
const vec3 C_BLUE  = vec3(0.230, 0.380, 1.000);
const vec3 C_MINT  = vec3(0.420, 0.950, 0.780);
const vec3 C_CORAL = vec3(1.000, 0.560, 0.480);

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const mat2 ROT = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = ROT * p * 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float t = uTime * 0.035;
  vec2 q = p * 1.25 + vec2(0.0, uScroll * 0.6);

  // Domain warping: noise displaced by noise gives soft filaments instead of
  // flat blobs.
  float w = fbm(q + vec2(t, -t * 0.6));
  vec2 warp = vec2(
    fbm(q + w + vec2(1.7, 9.2) + t * 0.5),
    fbm(q + w + vec2(8.3, 2.8) - t * 0.4)
  );
  float f = fbm(q + warp * 1.5);

  vec3 col = mix(C_DEEP, C_NAVY, smoothstep(0.0, 0.5, f));
  col = mix(col, C_BLUE, smoothstep(0.28, 0.75, f) * 0.62);
  col += C_MINT * smoothstep(0.55, 0.92, f) * 0.42;
  col += C_CORAL * smoothstep(0.52, 0.88, warp.x) * 0.32;

  // The pool of light behind the hero devices. Shaped by the same noise as the
  // aurora so the refraction picks up moving filaments, not a flat disc.
  vec2 fd = (p - uFocus.xy) / max(uFocus.z, 0.001);
  float fr = dot(fd, fd);
  float pool = exp(-fr * 0.85) * uFocus.w;
  float sweep = 0.5 + 0.5 * sin(fd.x * 1.6 - fd.y * 1.2 + uTime * 0.25 + f * 4.0);
  vec3 poolCol = mix(C_BLUE, C_MINT, sweep);
  poolCol = mix(poolCol, C_CORAL, smoothstep(0.2, 1.4, -fd.y + warp.y) * 0.55);
  col += poolCol * pool * (0.55 + 0.95 * f);

  // A faint light that follows the pointer, so the whole page feels lit by it.
  vec2 m = uMouse * vec2(uAspect, 1.0) * 0.5;
  vec2 dm = p - m;
  col += mix(C_MINT, C_BLUE, 0.5) * 0.07 * exp(-6.0 * dot(dm, dm));

  // Pull the far edges back toward black so body copy stays readable.
  float r = length(p * vec2(0.72, 1.15));
  col = mix(col, C_DEEP, smoothstep(0.6, 1.6, r) * 0.85);

  gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);
  #include <colorspace_fragment>

  // Dither: wide, low-contrast gradients band badly on 8-bit panels.
  gl_FragColor.rgb += (hash21(gl_FragCoord.xy) - 0.5) / 255.0;
}
`;
