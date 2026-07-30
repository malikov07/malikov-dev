/**
 * GLSL for the site's background.
 *
 * The effect is a set of merged metaballs treated as a sheet of liquid glass
 * floating over a drifting aurora. Rather than raytracing real geometry, the
 * blobs are a 2D signed-distance field; the field is turned into a dome-shaped
 * height map, and the gradient of that height gives a surface normal. That
 * normal is then used three times over — to displace the background behind the
 * glass (refraction), to split the displacement per colour channel
 * (dispersion), and to light the surface (fresnel rim + specular).
 *
 * Written in GLSL ES 1.00 so it compiles on both WebGL1 and WebGL2 contexts.
 */

export const VERTEX_SRC = /* glsl */ `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

export const FRAGMENT_SRC = /* glsl */ `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;      // in field space, already aspect-corrected
uniform vec2  u_stretch;    // pointer velocity; deforms the cursor blob
uniform float u_scroll;     // 0..1-ish, drives parallax
uniform float u_intensity;  // global dial, lets us fade the whole thing out

// --- palette ---------------------------------------------------------------
const vec3 C_DEEP   = vec3(0.016, 0.022, 0.055);
const vec3 C_INDIGO = vec3(0.086, 0.098, 0.325);
const vec3 C_BLUE   = vec3(0.145, 0.435, 0.945);
const vec3 C_VIOLET = vec3(0.404, 0.286, 0.788);
const vec3 C_CYAN   = vec3(0.259, 0.816, 0.929);
const vec3 C_PINK   = vec3(0.945, 0.361, 0.780);

// --- noise -----------------------------------------------------------------
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);          // smoothstep interpolation
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

// --- the aurora that sits behind the glass ---------------------------------
vec3 backdrop(vec2 p) {
  float t = u_time * 0.035;
  vec2 q = p * 1.25 + vec2(0.0, u_scroll * 0.35);

  // Domain warping: noise displaced by noise, which is what gives the
  // soft filament structure instead of flat blobs.
  float w = fbm(q + vec2(t, -t * 0.6));
  vec2 warp = vec2(
    fbm(q + w + vec2(1.7, 9.2) + t * 0.5),
    fbm(q + w + vec2(8.3, 2.8) - t * 0.4)
  );
  float f = fbm(q + warp * 1.5);

  // smoothstep rather than pow: fbm output clusters around 0.5, so a power
  // curve leaves the accent colours almost entirely unused.
  vec3 col = mix(C_DEEP, C_INDIGO, smoothstep(0.06, 0.56, f));
  col = mix(col, C_BLUE, smoothstep(0.28, 0.74, f) * 0.62);
  col = mix(col, C_VIOLET, smoothstep(0.52, 0.92, f) * 0.55);
  col += C_CYAN * smoothstep(0.56, 0.96, f) * 0.50;
  col += C_PINK * smoothstep(0.52, 0.90, warp.x) * 0.34;

  // Pull the far edges back toward black so text stays readable — but gently,
  // or the whole frame collapses to grey.
  float r = length(p * vec2(0.72, 1.15));
  col = mix(col, C_DEEP, smoothstep(0.48, 1.30, r));
  return col;
}

// --- the liquid metaball field ---------------------------------------------
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

/**
 * The pointer blob, deformed by how fast the pointer is moving.
 *
 * Space around the blob is rebuilt in a basis aligned with the direction of
 * travel, then scaled: elongated along that axis and pinched across it, which
 * is how a real droplet behaves under acceleration. The centre also trails
 * slightly behind the pointer, so the shape reads as being dragged.
 */
float cursorBlob(vec2 p) {
  float speed = length(u_stretch);
  vec2 centre = u_mouse - u_stretch * 0.30;
  vec2 q = p - centre;

  if (speed > 0.0005) {
    vec2 dir = u_stretch / speed;
    vec2 perp = vec2(-dir.y, dir.x);
    float along = dot(q, dir);
    float across = dot(q, perp);

    float elongate = 1.0 + speed * 2.4;
    // Pinching across roughly conserves area, so it stretches rather than
    // simply growing.
    float pinch = 1.0 + speed * 1.1;
    q = dir * (along / elongate) + perp * (across * pinch);
  }

  return length(q) - 0.125;
}

float field(vec2 p) {
  float t = u_time * 0.11;

  // Only the ambient blobs parallax with scroll. Offsetting all of p would
  // drag the cursor blob away from where the pointer actually is.
  vec2 ap = vec2(p.x, p.y + u_scroll * 0.55);

  float d = 1e5;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec2 c = vec2(
      sin(t * (0.62 + fi * 0.11) + fi * 2.13) * (0.40 + fi * 0.035),
      cos(t * (0.47 + fi * 0.15) + fi * 1.31) * (0.22 + fi * 0.028)
    );
    float r = 0.135 + 0.048 * sin(fi * 2.7 + 1.0);
    d = smin(d, length(ap - c) - r, 0.155);
  }

  // A sixth blob chases the pointer, so the glass feels physically present.
  d = smin(d, cursorBlob(p), 0.18);
  return d;
}

/** Dome profile: 0 outside the blob, rising steeply at the rim. */
float heightAt(vec2 p) {
  return sqrt(max(0.0, -field(p)));
}

void main() {
  // Normalise so y spans [-0.5, 0.5] and x follows the aspect ratio.
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;

  float d = field(p);
  vec3 col = backdrop(p);

  // Everything below only matters inside (or just outside) the glass.
  if (d < 0.055) {
    float e = 1.4 / u_res.y;
    float hx = heightAt(p + vec2(e, 0.0)) - heightAt(p - vec2(e, 0.0));
    float hy = heightAt(p + vec2(0.0, e)) - heightAt(p - vec2(0.0, e));

    // Gradient of the height map -> surface normal. The 0.30 tames how
    // aggressively the rim bends, which is the difference between "glass"
    // and "funhouse mirror".
    vec3 n = normalize(vec3(-hx / (2.0 * e) * 0.30, -hy / (2.0 * e) * 0.30, 1.0));

    float inside = smoothstep(0.004, -0.010, d);
    float thickness = heightAt(p);

    // Refraction: push the lookup outward along the normal, and split the
    // channels slightly so the rim shows a prism edge.
    vec2 off = n.xy * (0.085 + thickness * 0.30);
    vec3 refr;
    refr.r = backdrop(p + off * 0.92).r;
    refr.g = backdrop(p + off * 1.00).g;
    refr.b = backdrop(p + off * 1.09).b;

    // Glass is not neutral — it brightens and cools what passes through.
    refr = mix(refr, refr * vec3(0.94, 1.02, 1.12) + 0.045, 0.85);

    // Fresnel: grazing angles at the rim reflect most.
    float fres = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.2);
    // Rim runs cyan -> blue -> pink across the screen, so the glass edges
    // carry the same blue as the field behind them.
    float rimT = clamp(p.x * 0.9 + 0.5, 0.0, 1.0);
    vec3 rimCol = rimT < 0.5
      ? mix(C_CYAN, C_BLUE, rimT * 2.0)
      : mix(C_BLUE, C_PINK, (rimT - 0.5) * 2.0);
    refr += rimCol * fres * 1.25;

    // Specular highlight from a fixed key light.
    vec3 L = normalize(vec3(-0.45, 0.72, 0.62));
    float spec = pow(max(dot(n, L), 0.0), 34.0);
    refr += vec3(1.0) * spec * 0.55;

    // A soft inner glow keeps the blob centres from looking hollow.
    refr += C_VIOLET * thickness * 0.34;

    col = mix(col, refr, inside);

    // Outer halo — light scattering just beyond the surface.
    float halo = smoothstep(0.055, 0.0, d) * (1.0 - inside);
    col += rimCol * halo * 0.26;
  }

  col *= u_intensity;

  // Ordered-ish dither. Without it, these wide low-contrast gradients band
  // badly on 8-bit displays.
  float dither = (hash21(gl_FragCoord.xy) - 0.5) / 255.0;
  col += dither;

  gl_FragColor = vec4(col, 1.0);
}
`;
