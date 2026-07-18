import React from 'react';
import { AUTH_THEME as T } from '../../styles/authTheme';
import { FlagBunting } from '../FlagBunting';
function StadiumDecor() {
  return (
    <svg
      viewBox="0 0 600 480"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Stadium bowl ellipses — concentric rings give depth */}
      {([490, 400, 310, 222] as const).map((rx, i) => (
        <ellipse
          key={rx}
          cx={300} cy={530}
          rx={rx}  ry={rx * 0.42}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1.5 - i * 0.2}
        />
      ))}
      {/* Spotlight rays from top corners */}
      <line x1={0}   y1={0}   x2={300} y2={530} stroke="rgba(245,184,0,0.055)"  strokeWidth={1} />
      <line x1={600} y1={0}   x2={300} y2={530} stroke="rgba(245,184,0,0.055)"  strokeWidth={1} />
      <line x1={0}   y1={200} x2={300} y2={530} stroke="rgba(59,130,246,0.04)"  strokeWidth={1} />
      <line x1={600} y1={200} x2={300} y2={530} stroke="rgba(59,130,246,0.04)"  strokeWidth={1} />
      {/* Centre-circle suggestion */}
      <circle cx={300} cy={210} r={90} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1.5} strokeDasharray="8 5" />
      <circle cx={300} cy={210} r={5}  fill="rgba(255,255,255,0.07)" />
    </svg>
  );
}

// ── Dot-grid texture overlay ───────────────────────────────────────────────
function DotGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      aria-hidden="true"
      style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
        backgroundSize: '26px 26px',
        maskImage:        'radial-gradient(ellipse 90% 90% at 50% 50%, black 35%, transparent 100%)',
        WebkitMaskImage:  'radial-gradient(ellipse 90% 90% at 50% 50%, black 35%, transparent 100%)',
      }}
    />
  );
}

// ── Main layout component ──────────────────────────────────────────────────
interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  // Dev override: paste any image URL in the input below the login form to preview it
  const overrideUrl = typeof window !== 'undefined' ? localStorage.getItem('hero_image_preview') : null;
  const heroSrc = overrideUrl || T.heroImage;

  const heroBgStyle: React.CSSProperties = heroSrc
    ? {
        backgroundImage: `url(${heroSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 15%',
      }
    : { background: T.heroBg };

  return (
    <div
      className="min-h-[100dvh] flex flex-col lg:h-[100dvh] lg:flex-row lg:overflow-hidden"
      style={{ fontFamily: T.fontFamily }}
    >
      {/* Full-width flag strip pinned at very top — both mobile and desktop */}
      <div
        className="absolute top-0 left-0 right-0 z-50 py-1.5"
        style={{ background: 'rgba(6,8,9,0.55)', backdropFilter: 'blur(6px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <FlagBunting />
      </div>
      {/* ══════════════════════════════════════
          MOBILE — full-screen background image
          form floats at bottom over gradient
          ══════════════════════════════════════ */}
      <div className="lg:hidden relative flex flex-col min-h-[100dvh] overflow-y-auto" style={heroBgStyle}>

        {/* Gradient: clear at top → dark at bottom so image shows fully */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(6,8,9,0.1) 0%, transparent 25%, rgba(6,8,9,0.55) 55%, rgba(6,8,9,0.95) 72%, rgba(6,8,9,1) 100%)',
          }}
        />

        {/* Brand label */}
        <div className="relative z-10 px-6 pt-[72px]">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] flex items-center gap-2" style={{ color: T.gold, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            <span className="inline-block h-px w-5 rounded" style={{ background: T.gold }} />
            {T.heroEyebrow}
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] mt-1 ml-7" style={{ color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            {T.heroLeague}
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Form — no card, just floats on the gradient */}
        <div className="relative z-10 px-6 pb-10">
          {children}
        </div>
      </div>

      {/* ══════════════════════════════════════
          DESKTOP — side-by-side split panels
          ══════════════════════════════════════ */}

      {/* Left hero panel */}
      <div
        className="hidden lg:block relative overflow-hidden lg:w-[58%]"
        style={heroBgStyle}
      >
        <div className="absolute inset-0">
          <StadiumDecor />
          <DotGrid />
        </div>
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(rgba(6,8,9,${T.heroOverlayOpacity}), rgba(6,8,9,${T.heroOverlayOpacity}))` }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 85% 80% at 45% 50%, transparent 35%, rgba(6,8,9,0.65) 100%)' }}
        />

        <div className="relative z-10 flex flex-col justify-center h-full px-16 pt-14 pb-20">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3" style={{ color: T.gold }}>
            <span className="inline-block h-px w-8 rounded" style={{ background: T.gold }} />
            {T.heroEyebrow}
            <span className="inline-block h-px w-8 rounded" style={{ background: T.gold }} />
          </p>

          <div className="leading-none mb-4 select-none">
            <span className="block font-black uppercase" style={{ fontSize: 'clamp(3rem, 6.5vw, 5.2rem)', letterSpacing: '0.04em', color: '#eef2ff', fontFamily: '"Bebas Neue", sans-serif' }}>
              WORLD CUP
            </span>
            <span className="block font-black" style={{ fontSize: 'clamp(4.5rem, 10vw, 9rem)', letterSpacing: '0.02em', color: T.gold, marginTop: '-0.06em', lineHeight: 0.88, textShadow: `0 0 60px rgba(245,184,0,0.2)`, fontFamily: '"Bebas Neue", sans-serif' }}>
              {T.heroYear}
            </span>
          </div>

          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-5" style={{ color: 'rgba(238,242,255,0.4)' }}>
            {T.heroLeague}
          </p>
          <div className="h-px w-16 mb-6 rounded" style={{ background: `linear-gradient(90deg, ${T.gold}, ${T.green}, transparent)` }} />
          <p className="text-base font-semibold" style={{ color: 'rgba(238,242,255,0.45)', letterSpacing: '0.02em' }}>
            {T.heroTagline}
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div
        className="hidden lg:flex flex-1 flex-col items-center overflow-y-auto"
        style={{ background: T.formBg }}
      >
        <div className="w-full h-[3px] flex-shrink-0" style={{ background: `linear-gradient(90deg, transparent, ${T.gold} 40%, ${T.green} 100%)` }} />
        <div className="w-full max-w-sm flex-1 flex flex-col justify-center px-6 py-8">
          {children}
        </div>
        {/* ── Image preview tool (local dev only) ── */}
        <HeroImagePicker currentUrl={heroSrc} />
      </div>
    </div>
  );
}

function HeroImagePicker({ currentUrl }: { currentUrl: string | null }) {
  const [val, setVal] = React.useState(currentUrl ?? '');
  const apply = () => {
    if (val.trim()) { localStorage.setItem('hero_image_preview', val.trim()); window.location.reload(); }
    else { localStorage.removeItem('hero_image_preview'); window.location.reload(); }
  };
  return (
    <div style={{ width: '100%', padding: '12px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>
        🖼 Hero Image Preview
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && apply()}
          placeholder="Paste any image URL and press Enter…"
          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 10px', fontSize: 11, color: 'rgba(255,255,255,0.7)', outline: 'none' }}
        />
        <button onClick={apply} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(245,184,0,0.85)', color: '#000', fontWeight: 900, fontSize: 11, cursor: 'pointer', border: 'none' }}>
          Apply
        </button>
        <button onClick={() => { localStorage.removeItem('hero_image_preview'); setVal(''); window.location.reload(); }} style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer', border: 'none' }}>
          Reset
        </button>
      </div>
    </div>
  );
}
