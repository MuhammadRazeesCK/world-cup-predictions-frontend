/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   AUTH PAGE THEME — change here, nowhere else needed    ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * This is the single place to control the look of the login / signup pages.
 * You never need to touch component code for visual-only changes.
 *
 *  Common changes:
 *  ─ Swap the hero image  →  set heroImage to a URL or local path
 *  ─ Change fonts         →  load font in index.html, update fontFamily
 *  ─ Change accent colour →  update gold / cyan / green
 *  ─ Darker / lighter     →  adjust pageBg, formBg
 *  ─ Change tagline copy  →  update heroTagline / heroLeague
 */
export const AUTH_THEME = {

  // ── HERO IMAGE ────────────────────────────────────────────────────────
  // Set to a path/URL to use a real photo, e.g. '/assets/wc-hero.jpg'
  // or 'https://example.com/stadium.jpg'.
  // null → the CSS gradient (heroBg) is used instead.
  heroImage: '/assets/hero.jpeg' as string | null,

  // How dark the overlay on top of heroImage is (0 = none, 1 = full black).
  // Increase if text is hard to read against a bright photo.
  heroOverlayOpacity: 0.38,

  // CSS background used when heroImage is null.
  // Replace the whole string with any CSS background value.
  heroBg: [
    'radial-gradient(ellipse 130% 90% at 0% 115%,  rgba(22,163,74,0.28)  0%, transparent 52%)',
    'radial-gradient(ellipse 80%  80%  at 100% -10%, rgba(245,184,0,0.10)  0%, transparent 55%)',
    'radial-gradient(ellipse 60%  50%  at 50% 40%,   rgba(245,184,0,0.04)  0%, transparent 70%)',
    'linear-gradient(155deg, #060809 0%, #0c130a 55%, #060809 100%)',
  ].join(', '),

  // ── ACCENT COLORS ─────────────────────────────────────────────────────
  gold:   '#f5b800',
  cyan:   '#22c55e',
  green:  '#16a34a',
  blue:   '#f5b800',
  danger: '#ef4444',

  // ── SURFACES ──────────────────────────────────────────────────────────
  pageBg:      '#0a0a0a',
  formBg:      '#111111',
  // Glass inputs — transparent so the hero image shows through
  inputBg:     'rgba(255,255,255,0.04)',
  borderColor: 'rgba(255,255,255,0.14)',

  // ── TYPOGRAPHY ────────────────────────────────────────────────────────
  // 1. Add <link> to index.html for a Google Font
  // 2. Change fontFamily — e.g. '"Bebas Neue", sans-serif'
  fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',

  // ── HERO COPY ─────────────────────────────────────────────────────────
  heroEyebrow: 'FIFA WORLD CUP',
  heroYear:    '2026',
  heroLeague:  'PREDICTIONS LEAGUE',
  heroTagline: 'Predict. Compete. Dominate.',

  // Decorative country flags shown at the bottom of the hero panel
  heroFlags: [
    '🇧🇷','🇦🇷','🇫🇷','🇩🇪','🇵🇹','🇪🇸',
    '🏴󠁧󠁢󠁥󠁮󠁧󠁿','🇮🇹','🇯🇵','🇺🇸','🇲🇽','🇳🇱',
  ],

} as const;
