#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_seed;

uniform float u_speed;
uniform float u_repeatPeriod;
uniform float u_streakLength;

uniform int u_streakCount;
uniform float u_thickness;
uniform float u_centerVoidRadius;
uniform float u_jitter;
uniform float u_jitterSpin;
uniform float u_jitterSpinMix;
uniform float u_cornerRadius;

uniform vec3 u_beamColors[8];
uniform int u_beamColorCount;
uniform float u_brightness;
uniform float u_coreWhite;
uniform vec3 u_backgroundColor;
uniform float u_bloomStrength;
uniform float u_exposure;
uniform float u_vignette;

out vec4 outColor;

#define TAU 6.28318530718
#define MAX_BEAM_COLORS 8

float hash11(float p) {
  return fract(sin(p * 127.1 + u_seed * 19.7) * 43758.5453123);
}

float angleDiff(float a, float b) {
  return abs(atan(sin(a - b), cos(a - b)));
}

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

float singleStreak(float r, float a, float id, float loopT) {
  float baseAngle = hash11(id * 3.17) * TAU;
  float staticJitter = (hash11(id * 7.91) - 0.5) * u_jitter * TAU;

  // Subset of beams rotate clockwise; per-beam speed variation
  float spinGate = step(hash11(id * 11.37), u_jitterSpinMix);
  float spinRate = u_jitterSpin * (0.35 + 0.65 * hash11(id * 13.91));
  float spinAngle = spinGate * spinRate * u_time;

  float streakAngle = baseAngle + staticJitter + spinAngle;

  float period = max(u_repeatPeriod, 0.05);
  float lenNorm = clamp(u_streakLength / period, 0.04, 0.92);
  float radial = r / period;

  float local = fract(hash11(id * 2.71) + loopT - radial);
  if (local > lenNorm) {
    return 0.0;
  }

  // Rounded caps: taper beam width toward both tips (circular-arc profile)
  float cap = max(u_cornerRadius * lenNorm * 0.5, 0.001);
  float hf = clamp(local / cap, 0.0, 1.0);
  float tf = clamp((lenNorm - local) / cap, 0.0, 1.0);
  float capWidthScale = sqrt(min(hf, tf));  // sqrt → circular cross-section

  float across = angleDiff(a, streakAngle);
  float effThick = max(u_thickness * capWidthScale, 0.0005);
  float angMask = 1.0 - smoothstep(effThick * 0.35, effThick, across);

  float headCap = smoothstep(0.0, cap, local);
  float tailCap = 1.0 - smoothstep(lenNorm - cap, lenNorm, local);
  float alongMask = headCap * tailCap;

  float mask = angMask * alongMask;
  if (mask < 0.0001) {
    return 0.0;
  }

  float along = local / lenNorm;
  float core = pow(1.0 - along, 2.0);
  float body = pow(1.0 - along, 0.55);
  float intensity = mix(body, core, u_coreWhite);

  return mask * intensity;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.x;
  float r = length(uv);
  float a = atan(uv.y, uv.x);

  float loopT = fract(u_time * u_speed);
  int colorCount = clamp(u_beamColorCount, 1, MAX_BEAM_COLORS);

  vec3 col = u_backgroundColor;
  float voidMask = smoothstep(u_centerVoidRadius * 0.65, u_centerVoidRadius * 1.15, r);

  float accum = 0.0;
  vec3 streakAccum = vec3(0.0);

  for (int i = 0; i < 128; i++) {
    if (i >= u_streakCount) break;

    float id = float(i);
    float s = singleStreak(r, a, id, loopT);
    if (s <= 0.0001) continue;

    int idx = int(floor(hash11(id * 5.13) * float(colorCount)));
    idx = clamp(idx, 0, colorCount - 1);

    vec3 beamCol = pickBeamColor(idx);
    streakAccum += beamCol * s * u_brightness;
    accum += s;
  }

  col += streakAccum * voidMask;

  float bloom = accum * u_bloomStrength;
  col += streakAccum * bloom * 0.35;
  col = mix(col, col + bloom * 0.15, u_bloomStrength);
  col *= u_exposure;

  if (u_vignette > 0.0) {
    float vig = smoothstep(1.2, 0.25, r * (1.0 + u_vignette * 0.5));
    col *= mix(1.0 - u_vignette * 0.6, 1.0, vig);
  }

  col = pow(max(col, 0.0), vec3(0.92));
  outColor = vec4(col, 1.0);
}
