import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Button } from '../common/Button';
import { WC2026_TEAMS } from '../../utils/teams';
import { formatKickoffIST } from '../../utils/timezone';

const CARD_W = 720;
const PREVIEW_SCALE = 0.72;

function getFlag(name: string): string {
  return WC2026_TEAMS.find((t) => t.name === name)?.flag ?? '🏳️';
}
function fmtDate(): string {
  return new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// Consistent per-user avatar colour (matches ExportTab palette)
const PALETTES: [string, string][] = [
  ['#6366f1','#818cf8'],['#8b5cf6','#a78bfa'],['#ec4899','#f472b6'],
  ['#14b8a6','#2dd4bf'],['#f59e0b','#fbbf24'],['#10b981','#34d399'],
  ['#3b82f6','#60a5fa'],['#ef4444','#f87171'],['#a855f7','#c084fc'],
  ['#06b6d4','#22d3ee'],['#84cc16','#a3e635'],['#f97316','#fb923c'],
];
function pal(name: string): [string, string] {
  const h = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTES[h % PALETTES.length];
}

const D = {
  bg: '#0a0a0a',
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  gold: '#f5b800',
  goldDim: 'rgba(245,184,0,0.15)',
  red: '#f87171',
  redBg: 'rgba(248,113,113,0.10)',
  redBorder: 'rgba(248,113,113,0.25)',
  text: '#f0f4ff',
  textDim: '#b8c8e0',
  textMuted: 'rgba(255,255,255,0.35)',
  dots: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23ffffff' fill-opacity='0.04'/%3E%3C/svg%3E")`,
};

export type PendingGroup = {
  fixture: {
    id: string;
    match_number: number;
    home_team: string;
    away_team: string;
    kickoff_time: string;
    stage: string;
    status: string;
  };
  pending_users: string[];
};

function UserChip({ name }: { name: string }) {
  const [from, to] = pal(name);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 11px 4px 6px',
      borderRadius: 999,
      background: D.redBg,
      border: `1px solid ${D.redBorder}`,
    }}>
      {/* mini avatar */}
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: `linear-gradient(135deg, ${from}, ${to})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 900, color: '#fff', flexShrink: 0,
      }}>
        {name.charAt(0).toUpperCase()}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: D.red, letterSpacing: '0.01em' }}>
        @{name}
      </span>
    </div>
  );
}

function CardBody({ cardRef, groups }: { cardRef: React.RefObject<HTMLDivElement>; groups: PendingGroup[] }) {
  const withPending = groups.filter((g) => (g.pending_users ?? []).length > 0);

  return (
    <div
      ref={cardRef}
      style={{
        width: CARD_W,
        background: D.bg,
        color: D.text,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Top gold bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${D.gold}, rgba(245,184,0,0.4), transparent)` }} />

      {/* Header */}
      <div style={{
        padding: '22px 32px 18px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        borderBottom: `1px solid ${D.border}`,
        backgroundImage: D.dots,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.22em', color: D.gold, textTransform: 'uppercase', marginBottom: 6 }}>
            ⚽ WC 2026 Predictions League
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', color: D.text, lineHeight: 1 }}>
            Pending Submissions
          </div>
          <div style={{ fontSize: 11, color: D.textMuted, marginTop: 6, letterSpacing: '0.08em' }}>
            {withPending.length} match{withPending.length !== 1 ? 'es' : ''} need reminders · {fmtDate()}
          </div>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 8,
          background: D.redBg, border: `1px solid ${D.redBorder}`,
          color: D.red, letterSpacing: '0.05em',
        }}>
          ACTION NEEDED
        </div>
      </div>

      {/* Match cards */}
      <div style={{ padding: '16px 24px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {withPending.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: D.textMuted, fontSize: 14 }}>
            Everyone has submitted — nothing to remind! 🎉
          </div>
        ) : withPending.map(({ fixture: f, pending_users }) => (
          <div key={f.id} style={{
            background: '#111111',
            border: `1px solid ${D.border}`,
            borderLeft: `3px solid ${D.red}`,
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            {/* Match row */}
            <div style={{
              padding: '12px 16px 10px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: `1px solid rgba(255,255,255,0.05)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.15em',
                  color: D.textMuted, background: D.surface,
                  padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase',
                }}>
                  M{f.match_number}
                </span>
                <span style={{ fontSize: 15, fontWeight: 700, color: D.text }}>
                  {getFlag(f.home_team)} {f.home_team}
                  <span style={{ color: D.textMuted, margin: '0 8px', fontWeight: 400 }}>vs</span>
                  {getFlag(f.away_team)} {f.away_team}
                </span>
              </div>
              <div style={{ fontSize: 11, color: D.textMuted, fontWeight: 600, flexShrink: 0 }}>
                {formatKickoffIST(f.kickoff_time)}
              </div>
            </div>

            {/* Pending users row */}
            <div style={{ padding: '10px 16px 12px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: D.red, textTransform: 'uppercase', marginRight: 4, flexShrink: 0 }}>
                Not submitted:
              </span>
              {pending_users.map((u) => <UserChip key={u} name={u} />)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '14px 32px',
        marginTop: 8,
        borderTop: `1px solid ${D.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(0,0,0,0.4)',
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: D.textMuted, textTransform: 'uppercase' }}>
          ⚽ WC 2026 Predictions League
        </span>
        <span style={{ fontSize: 10, color: D.textMuted }}>Prediction window closes 30 min before kickoff</span>
      </div>
    </div>
  );
}

export function PendingReminderExport({ groups }: { groups: PendingGroup[] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // Only fixtures that actually have pending users are selectable
  const selectable = groups.filter((g) => (g.pending_users ?? []).length > 0);

  // Default: all selectable fixtures checked
  const [selected, setSelected] = useState<Set<string>>(() => new Set(selectable.map((g) => g.fixture.id)));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(selected.size === selectable.length ? new Set() : new Set(selectable.map((g) => g.fixture.id)));

  const selectedGroups = selectable.filter((g) => selected.has(g.fixture.id));

  const handleExport = async () => {
    if (!cardRef.current || selectedGroups.length === 0) return;
    setExporting(true);
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: D.bg,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `wc2026-pending-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      {/* Fixture selector */}
      {selectable.length > 0 && (
        <div className="mb-4 space-y-1.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary text-xs uppercase tracking-wide font-semibold">Select fixtures to include</span>
            <button
              onClick={toggleAll}
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: '#f5b800' }}
            >
              {selected.size === selectable.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          {selectable.map(({ fixture: f, pending_users }) => (
            <label
              key={f.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
              style={{
                background: selected.has(f.id) ? 'rgba(245,184,0,0.07)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selected.has(f.id) ? 'rgba(245,184,0,0.25)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <input
                type="checkbox"
                checked={selected.has(f.id)}
                onChange={() => toggle(f.id)}
                className="accent-yellow-400 w-3.5 h-3.5 shrink-0"
              />
              <span className="text-text-primary text-xs font-medium flex-1 min-w-0 truncate">
                M{f.match_number} · {f.home_team} vs {f.away_team}
              </span>
              <span className="text-xs shrink-0" style={{ color: '#f87171' }}>
                {(pending_users ?? []).length} pending
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Export button */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-secondary text-xs">
          {selectedGroups.length} match{selectedGroups.length !== 1 ? 'es' : ''} selected for export
        </span>
        <button
          onClick={handleExport}
          disabled={exporting || selectedGroups.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-opacity disabled:opacity-40"
          style={{ background: 'rgba(245,184,0,0.15)', color: '#f5b800', border: '1px solid rgba(245,184,0,0.3)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {exporting ? 'Exporting…' : 'Export as Image'}
        </button>
      </div>

      {/* Scaled preview — only selected fixtures */}
      {selectedGroups.length > 0 ? (
        <div style={{
          width: CARD_W * PREVIEW_SCALE,
          overflow: 'hidden',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.08)',
          margin: '0 auto',
        }}>
          <div style={{
            transform: `scale(${PREVIEW_SCALE})`,
            transformOrigin: 'top left',
            width: CARD_W,
          }}>
            <CardBody cardRef={cardRef} groups={selectedGroups} />
          </div>
        </div>
      ) : (
        <div className="text-center text-text-secondary text-sm py-6">
          Select at least one fixture to preview the image.
        </div>
      )}
    </div>
  );
}
