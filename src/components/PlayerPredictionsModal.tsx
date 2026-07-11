import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { predictionsApi } from '../api/predictions';
import { PredictionHistoryItem } from '../types';
import { formatStageName } from '../utils/timezone';
import { DateTime } from 'luxon';
import { TeamFlag } from '../utils/teams';

/* ─── result config ───────────────────────────────────────────── */
const RC: Record<string, { color: string; label: string; icon: string }> = {
  exact:        { color: '#4ade80', label: 'Exact Score',    icon: '🎯' },
  winner:       { color: '#60a5fa', label: 'Correct Winner', icon: '✅' },
  draw_correct: { color: '#fb923c', label: 'Draw +2',        icon: '🤝' },
  wrong:        { color: '#f87171', label: 'Wrong',          icon: '❌' },
};

/* ─── single prediction card ──────────────────────────────────── */
function PredCard({ item }: { item: PredictionHistoryItem }) {
  const rt = item.result.result_type || 'wrong';
  const cfg = RC[rt] ?? RC.wrong;
  const kickoff = DateTime.fromISO(item.fixture.kickoff_time).setZone('Asia/Kolkata').toFormat('d MMM, h:mm a');
  const hasPens = item.result.penalty_home_score != null;
  const hasPredPens = item.prediction.penalty_home_goals != null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.07)`, borderLeft: `3px solid ${cfg.color}` }}
    >
      <div className="px-4 py-3.5 space-y-2.5">
        {/* Top meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
            >
              {formatStageName(item.fixture.stage)}
            </span>
          </div>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{kickoff}</span>
        </div>

        {/* Teams with flags */}
        <div className="flex items-center gap-2">
          <TeamFlag name={item.fixture.home_team} className="w-6 h-4 rounded-sm object-cover flex-shrink-0" />
          <span className="text-xs font-black uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {item.fixture.home_team}
          </span>
          <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>vs</span>
          <span className="text-xs font-black uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {item.fixture.away_team}
          </span>
          <TeamFlag name={item.fixture.away_team} className="w-6 h-4 rounded-sm object-cover flex-shrink-0" />
        </div>

        {/* Scores row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Pick */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Pick</p>
              <p
                className="font-black tabular-nums"
                style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.5rem', lineHeight: 1, color: 'rgba(255,255,255,0.5)' }}
              >
                {item.prediction.predicted_home_goals}–{item.prediction.predicted_away_goals}
              </p>
              {hasPredPens && (
                <p className="text-[9px] font-bold mt-0.5" style={{ color: 'rgba(245,184,0,0.6)' }}>
                  pens {item.prediction.penalty_home_goals}–{item.prediction.penalty_away_goals}
                </p>
              )}
            </div>

            {/* Arrow */}
            {item.result.home_goals !== undefined && (
              <span className="text-lg" style={{ color: 'rgba(255,255,255,0.12)' }}>→</span>
            )}

            {/* Result */}
            {item.result.home_goals !== undefined && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Result</p>
                <p
                  className="font-black tabular-nums"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.5rem', lineHeight: 1, color: '#fff' }}
                >
                  {item.result.home_goals}–{item.result.away_goals}
                </p>
                {hasPens && (
                  <p className="text-[9px] font-bold mt-0.5" style={{ color: 'rgba(245,184,0,0.6)' }}>
                    pens {item.result.penalty_home_score}–{item.result.penalty_away_score}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Result badge + pts */}
          <div className="flex flex-col items-end gap-1">
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
              style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
            >
              {cfg.icon} {cfg.label}
            </span>
            <span
              className="font-black tabular-nums"
              style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', lineHeight: 1, color: rt !== 'wrong' ? '#f5b800' : 'rgba(255,255,255,0.2)' }}
            >
              {item.result.points ?? 0}<span className="text-xs font-bold ml-0.5" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'inherit' }}>pts</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── avatar initials ─────────────────────────────────────────── */
function Avatar({ username }: { username: string }) {
  const colors = ['#f5b800','#3b82f6','#8b5cf6','#10b981','#f97316','#ec4899'];
  const c = colors[username.charCodeAt(0) % colors.length];
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0"
      style={{ background: `${c}20`, border: `2px solid ${c}40`, color: c }}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

/* ─── eye icon ────────────────────────────────────────────────── */
export function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

/* ─── modal ───────────────────────────────────────────────────── */
export function PlayerPredictionsModal({ username, onClose }: { username: string; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['predictions', 'user', username],
    queryFn: () => predictionsApi.getUserHistory(username).then((r) => r.data),
    staleTime: 60_000,
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const stats = data ? {
    total: data.total,
    pts: data.predictions.reduce((s, p) => s + (p.result.points ?? 0), 0),
    exact: data.predictions.filter(p => p.result.result_type === 'exact').length,
    correct: data.predictions.filter(p => p.result.result_type === 'winner' || p.result.result_type === 'draw_correct').length,
  } : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Sheet */}
      <div
        className="rounded-t-3xl flex flex-col"
        style={{
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: '88vh',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar username={username} />
              <div>
                <h2 className="font-black text-white" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.3rem', letterSpacing: '0.04em' }}>
                  @{username}
                </h2>
                {stats && (
                  <p className="text-xs text-white/30 mt-0.5">{stats.total} completed predictions</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              ✕
            </button>
          </div>

          {/* Stats strip */}
          {stats && (
            <div className="flex gap-2 mt-4">
              {[
                { label: 'Points', value: stats.pts, color: '#f5b800' },
                { label: 'Exact', value: stats.exact, color: '#4ade80' },
                { label: 'Correct', value: stats.correct, color: '#60a5fa' },
                { label: 'Played', value: stats.total, color: 'rgba(255,255,255,0.4)' },
              ].map(s => (
                <div
                  key={s.label}
                  className="flex-1 rounded-xl px-3 py-2 text-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="font-black text-lg leading-none" style={{ color: s.color, fontFamily: '"Bebas Neue", sans-serif' }}>{s.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Predictions list */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-2.5">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-12">
              <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(245,184,0,0.3)', borderTopColor: '#f5b800' }} />
              <span className="text-white/30 text-sm">Loading…</span>
            </div>
          )}
          {!isLoading && data?.predictions.length === 0 && (
            <p className="text-center py-12 text-white/25 text-sm">No completed predictions yet.</p>
          )}
          {!isLoading && data?.predictions.map(item => <PredCard key={item.id} item={item} />)}
        </div>
      </div>
    </div>
  );
}
