/**
 * Cylin Painters - Color Moodboard (front-end only)
 * Generates a cohesive palette and applies it to site CSS variables.
 */

(function () {
  const STORAGE_KEY = 'cylin.moodboard.palette.v1';
  const STORAGE_THEME_KEY = 'cylin.a11y.contrast.v1';

  const VIBES = [
    { key: 'luxury', label: 'Luxury', base: ['#0f172a', '#1a365d', '#d69e2e', '#ecc94b'] },
    { key: 'modern', label: 'Modern', base: ['#0f172a', '#2c5282', '#e5e7eb', '#d69e2e'] },
    { key: 'calm', label: 'Calm', base: ['#0b3a3d', '#1a4c57', '#cfe8e5', '#d69e2e'] },
    { key: 'warm', label: 'Warm', base: ['#1a365d', '#7c2d12', '#fef3c7', '#d69e2e'] },
    { key: 'eco', label: 'Eco', base: ['#064e3b', '#14532d', '#d1fae5', '#ecc94b'] },
  ];

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  // #RRGGBB -> {r,g,b}
  function hexToRgb(hex) {
    const h = hex.replace('#', '').trim();
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const num = parseInt(full, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  function rgbToHex({ r, g, b }) {
    const to = (x) => x.toString(16).padStart(2, '0');
    return `#${to(clamp(Math.round(r), 0, 255))}${to(clamp(Math.round(g), 0, 255))}${to(clamp(Math.round(b), 0, 255))}`;
  }

  // mix two colors by amount t (0..1)
  function mix(hexA, hexB, t) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    return rgbToHex({
      r: a.r + (b.r - a.r) * t,
      g: a.g + (b.g - a.g) * t,
      b: a.b + (b.b - a.b) * t,
    });
  }

  function applyPalette({ primary, primaryLight, accent, accentLight }) {
    const root = document.documentElement;
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--primary-light', primaryLight);
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-light', accentLight);

    // Keep scroll reveal a bit consistent with palette
    root.style.setProperty('--reveal-highlight', accentLight);
  }

  function generatePalette(vibeKey) {
    const vibe = VIBES.find((v) => v.key === vibeKey) || VIBES[0];
    const [dark, primary, accent, accentLightBase] = vibe.base;

    const primaryMain = mix(dark, primary, 0.55);
    const primaryLight = mix(primaryMain, '#ffffff', 0.35);

    const accentMain = mix(accent, accentLightBase, 0.25);
    const accentLight = mix(accentLightBase, '#ffffff', 0.12);

    return {
      primary: primaryMain,
      primaryLight,
      accent: accentMain,
      accentLight,
    };
  }

  function renderSwatches(container, palette) {
    if (!container) return;
    const swatches = [
      { label: 'Primary', value: palette.primary },
      { label: 'Primary Light', value: palette.primaryLight },
      { label: 'Accent', value: palette.accent },
      { label: 'Accent Light', value: palette.accentLight },
    ];

    container.innerHTML = swatches
      .map(
        (s) => `
        <button
          type="button"
          class="mood-swatch"
          title="${s.label} ${s.value}"
          aria-label="${s.label} ${s.value}"
          data-color="${s.value}"
        >
          <span class="mood-swatch-color" style="background:${s.value}"></span>
          <span class="mood-swatch-label">${s.label}</span>
        </button>
      `
      )
      .join('');
  }

  function setupMoodboard() {
    const board = document.getElementById('moodboard');
    if (!board) return;

    const vibeSelect = board.querySelector('#moodVibe');
    const wallSelect = board.querySelector('#moodWallTone');
    const swatchesEl = board.querySelector('#moodSwatches');
    const applyBtn = board.querySelector('#moodApply');
    const saveBtn = board.querySelector('#moodSave');
    const resetBtn = board.querySelector('#moodReset');

    const state = {
      lastPalette: null,
    };

    function computeFinalPalette() {
      const vibeKey = vibeSelect?.value || 'luxury';
      let palette = generatePalette(vibeKey);

      // wall tone nudges contrast/brightness
      const wallTone = wallSelect?.value || 'neutral';
      if (wallTone === 'light') {
        palette.primaryLight = mix(palette.primaryLight, '#ffffff', 0.18);
        palette.accentLight = mix(palette.accentLight, '#ffffff', 0.14);
      } else if (wallTone === 'dark') {
        palette.primary = mix(palette.primary, '#000000', 0.08);
        palette.primaryLight = mix(palette.primaryLight, palette.primary, 0.22);
      } else if (wallTone === 'warm') {
        palette.primary = mix(palette.primary, '#7c2d12', 0.08);
        palette.accent = mix(palette.accent, '#b45309', 0.10);
      }

      return palette;
    }

    function preview() {
      state.lastPalette = computeFinalPalette();
      applyPalette(state.lastPalette);
      renderSwatches(swatchesEl, state.lastPalette);
    }

    function loadSaved() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const saved = JSON.parse(raw);
        if (!saved?.primary) return false;
        applyPalette(saved);
        renderSwatches(swatchesEl, saved);
        state.lastPalette = saved;
        return true;
      } catch {
        return false;
      }
    }

    // initial
    if (!loadSaved()) preview();

    // live updates
    vibeSelect?.addEventListener('change', preview);
    wallSelect?.addEventListener('change', preview);

    applyBtn?.addEventListener('click', () => {
      // palette already applied via preview; still provide a micro-confirm
      if (applyBtn) {
        const old = applyBtn.innerHTML;
        applyBtn.innerHTML = '<i class="fas fa-check"></i> Applied';
        setTimeout(() => (applyBtn.innerHTML = old), 900);
      }
    });

    saveBtn?.addEventListener('click', () => {
      if (!state.lastPalette) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lastPalette));
        const old = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Saved';
        setTimeout(() => (saveBtn.innerHTML = old), 900);
      } catch {}
    });

    resetBtn?.addEventListener('click', () => {
      const defaultPalette = {
        primary: '#1a365d',
        primaryLight: '#2c5282',
        accent: '#d69e2e',
        accentLight: '#ecc94b',
      };
      state.lastPalette = defaultPalette;
      applyPalette(defaultPalette);
      renderSwatches(swatchesEl, defaultPalette);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    });

    // Swatch copy
    swatchesEl?.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-color]');
      if (!btn) return;
      const color = btn.getAttribute('data-color');
      if (!color) return;

      try {
        await navigator.clipboard.writeText(color);
        const old = btn.querySelector('.mood-swatch-label')?.textContent || 'Color';
        const label = btn.querySelector('.mood-swatch-label');
        if (label) {
          label.textContent = 'Copied!';
          setTimeout(() => (label.textContent = old), 900);
        }
      } catch {
        // no-op
      }
    });
  }

  document.addEventListener('DOMContentLoaded', setupMoodboard);
})();

