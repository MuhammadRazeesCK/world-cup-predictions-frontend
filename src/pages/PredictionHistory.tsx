import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { usePredictionHistory } from '../hooks/usePredictions';
import { PredictionHistoryItem } from '../types';
import { formatKickoffIST, formatStageName } from '../utils/timezone';

const filterTabs = [
  { key: '', label: 'All' },
  { key: 'exact,winner', label: 'Correct' },
  { key: 'wrong', label: 'Wrong' },
];

const resultConfig: Record<string, { borderColor: string; label: string; labelBg: string; labelColor: string; ptColor: string; pulse: boolean }> = {
  exact:   { borderColor: '#16a34a', label: 'Exact Score',      labelBg: 'rgba(22,163,74,0.12)',   labelColor: '#4ade80', ptColor: '#f5b800', pulse: false },
  winner:  { borderColor: '#3b82f6', label: 'Correct Winner',   labelBg: 'rgba(59,130,246,0.12)',  labelColor: '#60a5fa', ptColor: '#f5b800', pulse: false },
  wrong:   { borderColor: '#ef4444', label: 'Wrong',            labelBg: 'rgba(239,68,68,0.1)',    labelColor: '#f87171', ptColor: 'rgba(255,255,255,0.3)', pulse: false },
  pending: { borderColor: 'rgba(255,255,255,0.15)', label: 'Pending', labelBg: 'rgba(255,255,255,0.06)', labelColor: 'rgba(255,255,255,0.4)', ptColor: 'rgba(255,255,255,0.3)', pulse: true },
};

function SpinnerIcon() {
  return (
    <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
    </svg>
  );
}

function PredictionCard({ item }: { item: PredictionHistoryItem }) {
  const rt = item.result.result_type || 'pending';
  const cfg = resultConfig[rt] || resultConfig.pending;
  const isPending = rt === 'pending';

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.06)',
        borderLeft: `3px solid ${cfg.borderColor}`,
        animation: isPending ? 'pendingPulse 2.5s ease-in-out infinite' : undefined,
      }}
    >
      <div className="px-4 py-3.5">
        {/* Top row: stage badge + match info */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
          >
            {formatStageName(item.fixture.stage)}
          </span>
          <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            #{item.fixture.match_number} · {formatKickoffIST(item.fixture.kickoff_time)}
          </span>
        </div>

        {/* Match name */}
        <div className="font-black text-sm uppercase tracking-wide mb-3" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {item.fixture.home_team} <span style={{ color: 'rgba(255,255,255,0.2)' }}>vs</span> {item.fixture.away_team}
        </div>

        {/* Score comparison + result badge row */}
        <div className="flex items-center justify-between gap-3">
          {/* Scores */}
          <div className="flex items-center gap-3">
            {/* Your pick */}
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Your Pick
              </div>
              <div
                className="font-black tabular-nums"
                style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.6rem', lineHeight: 1, color: 'rgba(255,255,255,0.55)' }}
              >
                {item.prediction.predicted_home_goals} – {item.prediction.predicted_away_goals}
              </div>
              {item.prediction.penalty_home_goals !== null && item.prediction.penalty_away_goals !== null && (
                <div className="text-[9px] font-bold mt-0.5" style={{ color: 'rgba(245,184,0,0.6)' }}>
                  pens {item.prediction.penalty_home_goals}–{item.prediction.penalty_away_goals}
                </div>
              )}
            </div>

            {/* Arrow + Result */}
            {item.fixture.status === 'completed' && item.result.home_goals !== undefined && (
              <>
                <span className="font-black text-base" style={{ color: 'rgba(255,255,255,0.15)' }}>→</span>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Result
                  </div>
                  <div
                    className="font-black tabular-nums"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.6rem', lineHeight: 1, color: 'rgba(255,255,255,0.9)' }}
                  >
                    {item.result.home_goals} – {item.result.away_goals}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Result badge + points */}
          <div className="text-right flex-shrink-0">
            <span
              className="text-[9px] font-black px-2.5 py-1 rounded-lg inline-block mb-1.5 uppercase tracking-widest"
              style={{ background: cfg.labelBg, color: cfg.labelColor }}
            >
              {cfg.label}
            </span>
            {item.fixture.status === 'completed' && (
              <div
                className="font-black text-right"
                style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', lineHeight: 1, color: cfg.ptColor }}
              >
                {item.result.points ?? 0}
                <span className="text-xs font-bold ml-0.5" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'inherit' }}>pts</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PredictionHistory() {
  const [activeFilter, setActiveFilter] = useState('');
  const { data, isLoading, error } = usePredictionHistory({ result: activeFilter || undefined, limit: 50 });

  return (
    <div className="min-h-screen pb-20 sm:pb-8" style={{ background: '#0a0a0a' }}>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-5">

        {/* Page title */}
        <div className="mb-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(245,184,0,0.7)' }}>
            FIFA World Cup 2026
          </div>
          <h1 className="font-black text-white" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', letterSpacing: '0.04em' }}>
            My Predictions
          </h1>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5">
          {filterTabs.map(tab => {
            const active = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                style={active
                  ? { background: '#f5b800', color: '#0a0a0a' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {tab.label}
              </button>
            );
          })}
          {data && (
            <span className="ml-auto text-xs font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {data.total} predictions
            </span>
          )}
        </div>

        {/* States */}
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-14" style={{ color: 'rgba(255,255,255,0.25)' }}>
            <SpinnerIcon />
            <span className="text-xs uppercase tracking-widest font-bold">Loading predictions</span>
          </div>
        )}
        {error && (
          <div className="text-center py-6 text-xs font-bold uppercase tracking-wide" style={{ color: '#ef4444' }}>
            Failed to load
          </div>
        )}
        {!isLoading && data?.predictions.length === 0 && (
          <div
            className="rounded-xl text-center py-10 px-6"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Nothing here
            </div>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
              No predictions yet
            </p>
          </div>
        )}

        <div className="space-y-2.5">
          {data?.predictions.map(item => <PredictionCard key={item.id} item={item} />)}
        </div>
      </main>
      <Footer />
    </div>
  );
}

