import "./panel.css";

const MAX_BEAM_COLORS = 8;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function rgbToHex(r, g, b) {
  const toByte = (v) =>
    Math.round(clamp(v, 0, 1) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return [1, 1, 1];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
}

function isValidHex(hex) {
  return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);
}

function normalizeHex(hex) {
  let h = hex.trim();
  if (!h.startsWith("#")) h = `#${h}`;
  if (!isValidHex(h)) return null;
  if (h.length === 4) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  }
  return h.toLowerCase();
}

/**
 * @param {HTMLElement} mount
 * @param {Record<string, unknown>} params
 * @param {{ onChange?: () => void; onPreset?: () => void; onSave?: () => void }} callbacks
 */
export function createControlPanel(mount, params, callbacks = {}) {
  const bindings = [];
  let beamColorsRoot = null;
  let beamColorsDidMount = false;

  const emit = () => callbacks.onChange?.();

  mount.className = "panel";
  let staggerIndex = 0;
  const nextStagger = () => {
    const i = staggerIndex;
    staggerIndex += 1;
    return i;
  };

  mount.innerHTML = `
    <header class="panel__header panel-stagger" style="--stagger-index: 0">
      <h1 class="panel__title">Warp Shader</h1>
      <p class="panel__desc">Hyperspace streaks · black bg · square export</p>
    </header>
    <div class="panel__scroll" id="panel-sections"></div>
    <footer class="panel__footer panel-stagger">
      <div class="panel__footer-actions">
        <button type="button" class="btn btn--default" data-action="preset">Reference preset</button>
        <button type="button" class="btn btn--outline" data-action="save">Save settings</button>
      </div>
      <p class="panel__shortcuts">R — record 8s loop · S — save JSON</p>
    </footer>
  `;

  const sectionsEl = mount.querySelector("#panel-sections");

  mount.querySelector('[data-action="preset"]').addEventListener("click", () => {
    callbacks.onPreset?.();
    syncAll();
    emit();
  });

  mount.querySelector('[data-action="save"]').addEventListener("click", () => {
    callbacks.onSave?.();
  });

  function addSection(title, open = true) {
    const section = document.createElement("div");
    const idx = nextStagger();
    section.className = "section panel-stagger";
    section.style.setProperty("--stagger-index", String(idx));
    section.dataset.open = open ? "true" : "false";
    section.innerHTML = `
      <button type="button" class="section__trigger" aria-expanded="${open}">
        <span class="section__title">${title}</span>
        <svg class="section__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      <div class="section__body">
        <div class="section__body-inner"></div>
      </div>
    `;
    const trigger = section.querySelector(".section__trigger");
    const body = section.querySelector(".section__body-inner");

    trigger.addEventListener("click", () => {
      const next = section.dataset.open !== "true";
      section.dataset.open = next ? "true" : "false";
      trigger.setAttribute("aria-expanded", String(next));
    });

    sectionsEl.appendChild(section);
    return body;
  }

  function bindRange(
    container,
    label,
    key,
    { min, max, step, hint, onUpdate, full = false }
  ) {
    const field = document.createElement("div");
    field.className = full ? "field field--full" : "field";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = String(min);
    slider.max = String(max);
    slider.step = String(step);

    const number = document.createElement("input");
    number.type = "number";
    number.min = String(min);
    number.max = String(max);
    number.step = String(step);

    const labelEl = document.createElement("label");
    labelEl.className = "field__label";
    labelEl.textContent = label;
    if (hint) labelEl.title = hint;

    const syncDisplay = (v) => {
      slider.value = String(v);
      number.value = String(v);
    };

    const setValue = (raw) => {
      const v = clamp(Number(raw), min, max);
      params[key] = step >= 1 ? Math.round(v) : v;
      syncDisplay(params[key]);
      onUpdate?.();
      emit();
    };

    slider.addEventListener("input", () => setValue(slider.value));
    number.addEventListener("input", () => setValue(number.value));
    number.addEventListener("change", () => setValue(number.value));

    field.append(labelEl, slider, number);
    container.appendChild(field);

    bindings.push({ sync: () => syncDisplay(params[key]) });
    syncDisplay(params[key]);
  }

  function bindRgbColor(container, label, obj) {
    const field = document.createElement("div");
    field.className = "field field--color";

    const labelEl = document.createElement("span");
    labelEl.className = "field__label";
    labelEl.textContent = label;

    const swatch = document.createElement("div");
    swatch.className = "color-row__swatch";
    const picker = document.createElement("input");
    picker.type = "color";

    const sync = () => {
      picker.value = rgbToHex(obj.r, obj.g, obj.b);
      labelEl.title = `${label}: ${picker.value}`;
    };

    picker.addEventListener("input", () => {
      const [r, g, b] = hexToRgb(picker.value);
      obj.r = r;
      obj.g = g;
      obj.b = b;
      sync();
      emit();
    });

    swatch.appendChild(picker);
    field.append(labelEl, swatch);
    container.appendChild(field);

    bindings.push({ sync });
    sync();
  }

  function rebuildBeamColors() {
    if (!beamColorsRoot) return;
    beamColorsRoot.replaceChildren();

    const count = clamp(
      Math.round(params.beamColorCount),
      1,
      MAX_BEAM_COLORS
    );
    params.beamColorCount = count;
    beamColorsRoot.dataset.count = String(count);
    if (beamColorsDidMount) {
      beamColorsRoot.classList.remove("beam-colors--enter");
      void beamColorsRoot.offsetWidth;
      beamColorsRoot.classList.add("beam-colors--enter");
    } else {
      beamColorsDidMount = true;
    }

    for (let i = 0; i < count; i++) {
      const row = document.createElement("div");
      row.className = "color-row";

      const label = document.createElement("span");
      label.className = "color-row__label";
      label.textContent = `${i + 1}`;

      const swatch = document.createElement("div");
      swatch.className = "color-row__swatch";
      const picker = document.createElement("input");
      picker.type = "color";
      picker.value = params.beamColors[i] ?? "#ffffff";
      label.title = picker.value;

      picker.addEventListener("input", () => {
        params.beamColors[i] = picker.value;
        label.title = picker.value;
        emit();
      });

      swatch.appendChild(picker);
      row.append(label, swatch);
      beamColorsRoot.appendChild(row);
    }
  }

  // --- sections ---
  const motion = addSection("Motion", true);
  bindRange(motion, "Loop speed", "speed", {
    min: 0.05,
    max: 2,
    step: 0.01,
    hint: "Loop period ≈ 1 ÷ speed (seconds)",
  });
  bindRange(motion, "Repeat period", "repeatPeriod", {
    min: 0.1,
    max: 0.6,
    step: 0.01,
  });
  bindRange(motion, "Streak length", "streakLength", {
    min: 0.03,
    max: 0.25,
    step: 0.005,
  });

  const density = addSection("Density & shape", false);
  bindRange(density, "Streak count", "streakCount", {
    min: 16,
    max: 128,
    step: 1,
  });
  bindRange(density, "Thickness", "thickness", {
    min: 0.004,
    max: 0.06,
    step: 0.001,
  });
  bindRange(density, "Corner radius", "cornerRadius", {
    min: 0,
    max: 1,
    step: 0.01,
  });
  bindRange(density, "Center void", "centerVoidRadius", {
    min: 0,
    max: 0.25,
    step: 0.005,
  });
  bindRange(density, "Jitter", "jitter", {
    min: 0,
    max: 1,
    step: 0.01,
    hint: "Static random angle offset per beam",
  });
  bindRange(density, "Spin speed", "jitterSpin", {
    min: 0,
    max: 2,
    step: 0.01,
    hint: "Clockwise rotation speed (rad/s). 0 = off",
  });
  bindRange(density, "Spin beams", "jitterSpinMix", {
    min: 0,
    max: 1,
    step: 0.01,
    hint: "Fraction of beams that rotate clockwise",
  });

  const colorSection = addSection("Color", false);

  bindRange(colorSection, "Active colors", "beamColorCount", {
    min: 1,
    max: MAX_BEAM_COLORS,
    step: 1,
    hint: "Number of beam colors in the palette below",
    onUpdate: rebuildBeamColors,
  });

  const beamWrap = document.createElement("div");
  beamWrap.className = "beam-colors";
  beamColorsRoot = beamWrap;
  colorSection.appendChild(beamWrap);
  rebuildBeamColors();

  bindRange(colorSection, "Brightness", "brightness", {
    min: 0.2,
    max: 2.5,
    step: 0.01,
  });
  bindRange(colorSection, "Core white", "coreWhite", {
    min: 0,
    max: 1,
    step: 0.01,
  });
  bindRgbColor(colorSection, "Background", params.backgroundColor);
  bindRange(colorSection, "Bloom", "bloomStrength", {
    min: 0,
    max: 2,
    step: 0.01,
  });
  bindRange(colorSection, "Exposure", "exposure", {
    min: 0.3,
    max: 2.5,
    step: 0.01,
  });
  bindRange(colorSection, "Vignette", "vignette", { min: 0, max: 1, step: 0.01 });
  bindRange(colorSection, "Seed", "seed", { min: 0, max: 100, step: 0.1 });

  mount
    .querySelector(".panel__footer")
    .style.setProperty("--stagger-index", String(staggerIndex));

  function syncAll() {
    bindings.forEach((b) => b.sync());
    rebuildBeamColors();
  }

  requestAnimationFrame(() => {
    mount.classList.add("panel--mounted");
  });

  return { syncAll, rebuildBeamColors };
}

export { MAX_BEAM_COLORS, hexToRgb, normalizeHex };
