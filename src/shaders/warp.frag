#version 300 es
precision highp float;

// ── UNIFORMS ──────────────────────────────────────────────────────────────────
// All uniforms map 1-to-1 to WarpParams fields (see src/params.js).
// Uploaded every frame in src/gl/uniforms.js → uploadUniforms().
//
// AI AGENT GUIDE — to add a uniform:
//   1. Declare it here in the matching group.
//   2. Add its name to UNIFORM_NAMES in src/gl/uniforms.js.
//   3. Add upload logic in uploadUniforms() in that same file.
//   4. Add the default in src/params.js → DEFAULT_PARAMS.
// ─────────────────────────────────────────────────────────────────────────────

// Global
uniform vec2  u_resolution;
uniform float u_time;
uniform float u_seed;

// Motion
uniform float u_speed;
uniform float u_repeatPeriod;
uniform float u_streakLength;

// Shape
uniform int   u_streakCount;
uniform float u_thickness;
uniform float u_centerVoidRadius;
uniform float u_jitter;
uniform float u_jitterSpin;
uniform float u_jitterSpinMix;
uniform float u_cornerRadius;

// Color / Grade
uniform vec3  u_beamColors[8];
uniform int   u_beamColorCount;
uniform float u_brightness;
uniform float u_coreWhite;
uniform float u_bloomStrength;
uniform float u_exposure;
uniform float u_vignette;

// Background plate
uniform vec4      u_backgroundColor;   // rgb = color, a = opacity
uniform sampler2D u_backgroundImage;
uniform float     u_useBackgroundImage; // 0.0 or 1.0

out vec4 outColor;

#define TAU 6.28318530718
#define MAX_BEAM_COLORS 8

// ── HELPERS ───────────────────────────────────────────────────────────────────

float hash11(float p) {
  return fract(sin(p * 127.1 + u_seed * 19.7) * 43758.5453123);
}

float angleDiff(float a, float b) {
  return abs(atan(sin(a - b), cos(a - b)));
}

// GLSL ES does not support variable array indexing on uniform arrays on all
// drivers, so color selection uses an explicit if-chain instead of u_beamColors[idx].
vec3 pickBeamColor(int idx) {
  if (idx <= 0) return u_beamColors[0];
  if (idx == 1) return u_beamColors[1];
  if (idx == 2) return u_beamColors[2];
  if (idx == 3) return u_beamColors[3];
  if (idx == 4) return u_beamColors[4];
  if (idx == 5) return u_beamColors[5];
  if (idx == 6) return u_beamColors[6];
  return u_beamColors[7];
}

// ── BACKGROUND ────────────────────────────────────────────────────────────────
// Returns the background plate color at the current fragment.
// When backgroundUseImage is on, blends the image over the solid fill.

vec4 sampleBackground() {
  vec2 bgUv = gl_FragCoord.xy / u_resolution;
  bgUv.y = 1.0 - bgUv.y; // flip Y: GL origin is bottom-left, image origin is top-left

  vec4 bg = u_backgroundColor;

  if (u_useBackgroundImage > 0.5) {
    vec4 img = texture(u_backgroundImage, bgUv);
    bg.rgb = mix(bg.rgb, img.rgb, img.a);
    bg.a = bg.a * (1.0 - img.a) + img.a;
  }

  return bg;
}

// ── SINGLE STREAK ─────────────────────────────────────────────────────────────
// Returns the intensity [0,1] of one beam at polar coords (r, a).
// id  — beam index float, used as a hash seed for per-beam randomness.
// loopT — fract(time * speed), the normalized loop position [0,1).

float singleStreak(float r, float a, float id, float loopT) {
  // Per-beam random angle, static for the lifetime of the scene.
  float baseAngle   = hash11(id * 3.17) * TAU;
  float staticJitter = (hash11(id * 7.91) - 0.5) * u_jitter * TAU;

  // A fraction of beams (jitterSpinMix) rotate over time.
  float spinGate  = step(hash11(id * 11.37), u_jitterSpinMix);
  float spinRate  = u_jitterSpin * (0.35 + 0.65 * hash11(id * 13.91));
  float spinAngle = spinGate * spinRate * u_time;

  float streakAngle = baseAngle + staticJitter + spinAngle;

  // Map radial position to a [0,1] phase within the repeat period,
  // offset by a per-beam random phase so streaks stagger.
  float period  = max(u_repeatPeriod, 0.05);
  float lenNorm = clamp(u_streakLength / period, 0.04, 0.92);
  float radial  = r / period;
  float local   = fract(hash11(id * 2.71) + loopT - radial);

  if (local > lenNorm) return 0.0;

  // Cap width scale: streak tapers to a point at head and tail.
  float cap          = max(u_cornerRadius * lenNorm * 0.5, 0.001);
  float hf           = clamp(local / cap, 0.0, 1.0);
  float tf           = clamp((lenNorm - local) / cap, 0.0, 1.0);
  float capWidthScale = sqrt(min(hf, tf));

  // Angular mask: how close is this fragment to the beam's center angle?
  float across  = angleDiff(a, streakAngle);
  float effThick = max(u_thickness * capWidthScale, 0.0005);
  float angMask = 1.0 - smoothstep(effThick * 0.35, effThick, across);

  // Along-beam mask: smooth fade at head and tail.
  float headCap  = smoothstep(0.0, cap, local);
  float tailCap  = 1.0 - smoothstep(lenNorm - cap, lenNorm, local);
  float alongMask = headCap * tailCap;

  float mask = angMask * alongMask;
  if (mask < 0.0001) return 0.0;

  // Intensity profile: head is bright core, tail fades out.
  float along    = local / lenNorm;
  float core     = pow(1.0 - along, 2.0);
  float body     = pow(1.0 - along, 0.55);
  float intensity = mix(body, core, u_coreWhite);

  return mask * intensity;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

void main() {
  // Convert fragment coordinates to centered UV, normalized by width.
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.x;
  float r = length(uv);
  float a = atan(uv.y, uv.x);

  float loopT    = fract(u_time * u_speed);
  int colorCount = clamp(u_beamColorCount, 1, MAX_BEAM_COLORS);

  // ── BACKGROUND ──────────────────────────────────────────────────────────
  vec4 bg  = sampleBackground();
  vec3 col = bg.rgb;
  float outA = bg.a;

  // Void mask: fade beams out near the center so the origin stays clean.
  float voidMask = smoothstep(u_centerVoidRadius * 0.65, u_centerVoidRadius * 1.15, r);

  // ── STREAK ACCUMULATION ─────────────────────────────────────────────────
  float accum       = 0.0;
  vec3  streakAccum = vec3(0.0);

  for (int i = 0; i < 128; i++) {
    if (i >= u_streakCount) break;

    float id = float(i);
    float s  = singleStreak(r, a, id, loopT);
    if (s <= 0.0001) continue;

    int idx = int(floor(hash11(id * 5.13) * float(colorCount)));
    idx = clamp(idx, 0, colorCount - 1);

    streakAccum += pickBeamColor(idx) * s * u_brightness;
    accum       += s;
  }

  float voidedAccum = accum * voidMask;
  vec3  streaks     = streakAccum * voidMask;

  // ── BLOOM ────────────────────────────────────────────────────────────────
  // Simple bloom: scale the streak contribution by the accumulated density.
  float bloom = voidedAccum * u_bloomStrength;
  streaks += streakAccum * bloom * 0.35 * voidMask;

  // ── COMPOSITE ────────────────────────────────────────────────────────────
  // Light backgrounds clip with additive blending, so switch to alpha blend.
  float bgLum     = dot(bg.rgb, vec3(0.299, 0.587, 0.114));
  float streakMix = clamp(voidedAccum * 1.35, 0.0, 1.0);

  if (bgLum > 0.45) {
    vec3 streakRgb = streaks / max(voidedAccum, 0.0001);
    streakRgb = clamp(streakRgb * u_exposure, 0.0, 1.0);
    col = mix(bg.rgb, streakRgb, streakMix);
    col = mix(col, col + bloom * 0.12, u_bloomStrength);
  } else {
    col = bg.rgb + streaks;
    col = mix(col, col + bloom * 0.15, u_bloomStrength);
    col *= u_exposure;
  }

  // ── VIGNETTE ─────────────────────────────────────────────────────────────
  if (u_vignette > 0.0) {
    float vig = smoothstep(1.2, 0.25, r * (1.0 + u_vignette * 0.5));
    col *= mix(1.0 - u_vignette * 0.6, 1.0, vig);
  }

  // ── GAMMA + ALPHA OUTPUT ─────────────────────────────────────────────────
  // Slight gamma lift (^0.92) softens harsh clipping at peak brightness.
  col = pow(max(col, 0.0), vec3(0.92));

  float streakAlpha = min(1.0, accum * 0.92 * voidMask);
  outA = max(outA, streakAlpha);

  outColor = vec4(col, clamp(outA, 0.0, 1.0));
}
