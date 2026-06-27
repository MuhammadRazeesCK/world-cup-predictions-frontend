import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MatchCard } from '../components/MatchCard';
import { Modal } from '../components/common/Modal';
import { useAvailableFixtures } from '../hooks/useFixtures';
import { useUserStats, useLeaderboard } from '../hooks/useLeaderboard';
import { useAuth } from '../context/AuthContext';
import { predictionsApi } from '../api/predictions';
import { PredictionHistoryItem } from '../types';
import { formatKickoffIST, formatStageName } from '../utils/timezone';

function SpinnerIcon() {
  return (
    <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
    </svg>
  );
}

function RankIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" /><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11" />
    </svg>
  );
}

function PointsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function AccuracyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ExactIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function StatCard({ label, value, icon, gold = false }: { label: string; value: string | number; icon: React.ReactNode; gold?: boolean }) {
  return (
    <div
      className="flex-1 rounded-xl px-3 py-3.5 flex flex-col items-center gap-1.5"
      style={{
        background: gold ? 'rgba(245,184,0,0.06)' : 'rgba(255,255,255,0.03)',
        border: gold ? '1px solid rgba(245,184,0,0.2)' : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <span style={{ color: gold ? '#f5b800' : 'rgba(255,255,255,0.35)' }}>{icon}</span>
      <div
        className="font-black leading-none"
        style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: '1.7rem',
          color: gold ? '#f5b800' : '#ffffff',
          letterSpacing: '0.02em',
        }}
      >
        {value}
      </div>
      <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {label}
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const colors: Record<number, { bg: string; color: string }> = {
    1: { bg: 'rgba(245,184,0,0.15)', color: '#f5b800' },
    2: { bg: 'rgba(192,192,192,0.12)', color: '#d4d4d4' },
    3: { bg: 'rgba(180,100,40,0.15)', color: '#cd7f32' },
  };
  const style = colors[rank] ?? { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' };
  return (
    <span
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
      style={{ background: style.bg, color: style.color }}
    >
      {rank}
    </span>
  );
}

import React from 'react';

const resultConfig: Record<string, { borderColor: string; label: string; labelBg: string; labelColor: string; ptColor: string }> = {
  exact:   { borderColor: '#16a34a', label: 'Exact Score',    labelBg: 'rgba(22,163,74,0.12)',  labelColor: '#4ade80', ptColor: '#f5b800' },
  winner:  { borderColor: '#3b82f6', label: 'Correct Winner', labelBg: 'rgba(59,130,246,0.12)', labelColor: '#60a5fa', ptColor: '#f5b800' },
  wrong:   { borderColor: '#ef4444', label: 'Wrong',          labelBg: 'rgba(239,68,68,0.1)',   labelColor: '#f87171', ptColor: 'rgba(255,255,255,0.3)' },
};

function MiniPredCard({ item }: { item: PredictionHistoryItem }) {
  const rt = item.result.result_type || 'wrong';
  const cfg = resultConfig[rt] ?? resultConfig.wrong;
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `3px solid ${cfg.borderColor}` }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
            {formatStageName(item.fixture.stage)}
          </span>
          <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            #{item.fixture.match_number} · {formatKickoffIST(item.fixture.kickoff_time)}
          </span>
        </div>
        <div className="font-black text-sm uppercase tracking-wide mb-2.5" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {item.fixture.home_team} <span style={{ color: 'rgba(255,255,255,0.2)' }}>vs</span> {item.fixture.away_team}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Pick</div>
              <div className="font-black tabular-nums" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', lineHeight: 1, color: 'rgba(255,255,255,0.55)' }}>
                {item.prediction.predicted_home_goals} – {item.prediction.predicted_away_goals}
              </div>
            </div>
            {item.result.home_goals !== undefined && (
              <>
                <span className="font-black" style={{ color: 'rgba(255,255,255,0.15)' }}>→</span>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Result</div>
                  <div className="font-black tabular-nums" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', lineHeight: 1, color: 'rgba(255,255,255,0.9)' }}>
                    {item.result.home_goals} – {item.result.away_goals}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black px-2 py-1 rounded-lg inline-block mb-1 uppercase tracking-widest" style={{ background: cfg.labelBg, color: cfg.labelColor }}>
              {cfg.label}
            </span>
            <div className="font-black" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.2rem', lineHeight: 1, color: cfg.ptColor }}>
              {item.result.points ?? 0}<span className="text-xs font-bold ml-0.5" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'inherit' }}>pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserHistoryModal({ username, onClose }: { username: string; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['predictions', 'user', username],
    queryFn: () => predictionsApi.getUserHistory(username).then((r) => r.data),
    staleTime: 60_000,
  });
  return (
    <Modal isOpen onClose={onClose} title={`@${username}'s Predictions`} size="md">
      {isLoading && (
        <div className="flex justify-center py-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
          </svg>
        </div>
      )}
      {!isLoading && data?.predictions.length === 0 && (
        <p className="text-center text-sm py-8" style={{ color: 'rgba(255,255,255,0.35)' }}>No completed predictions yet.</p>
      )}
      {!isLoading && data && data.predictions.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>{data.total} completed predictions</div>
          {data.predictions.map(item => <MiniPredCard key={item.id} item={item} />)}
        </div>
      )}
    </Modal>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: available, isLoading, error } = useAvailableFixtures();
  const { data: stats } = useUserStats();
  const { data: leaderboard } = useLeaderboard({ limit: 5 });
  const [viewingUser, setViewingUser] = useState<string | null>(null);

  return (
    <div className="min-h-screen pb-20 sm:pb-8" style={{ background: '#0a0a0a' }}>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-6">

        {/* Welcome strip */}
        <div
          className="rounded-xl px-5 py-4"
          style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.07)',
            borderLeft: '3px solid #f5b800',
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(245,184,0,0.7)' }}>
            FIFA World Cup 2026
          </div>
          <div className="font-black text-xl text-white" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.5rem', letterSpacing: '0.03em' }}>
            Welcome back, <span style={{ color: '#f5b800' }}>@{user?.username}</span>
          </div>
          <div className="text-xs mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Make your predictions before the whistle blows
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="flex gap-2.5">
            <StatCard label="Rank"     value={stats.rank ? `#${stats.rank}` : '—'} icon={<RankIcon />}     gold />
            <StatCard label="Points"   value={stats.total_points}                   icon={<PointsIcon />}            />
            <StatCard label="Accuracy" value={`${stats.accuracy_percentage}%`}      icon={<AccuracyIcon />}          />
            <StatCard label="Exact"    value={stats.exact_predictions}              icon={<ExactIcon />}             />
          </div>
        )}

        {/* Upcoming matches */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-0.5 h-4 rounded-full" style={{ background: '#f5b800' }} />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Upcoming Fixtures
            </span>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-14" style={{ color: 'rgba(255,255,255,0.25)' }}>
              <SpinnerIcon />
              <span className="text-xs uppercase tracking-widest font-bold">Loading fixtures</span>
            </div>
          )}
          {error && (
            <div className="text-center py-6 text-xs font-bold uppercase tracking-wide" style={{ color: '#ef4444' }}>
              Failed to load fixtures
            </div>
          )}
          {!isLoading && available?.length === 0 && (
            <div
              className="rounded-xl text-center py-10 px-6"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                All clear
              </div>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                No fixtures in the next 48 hours
              </p>
            </div>
          )}
          <div className="space-y-3">
            {available?.map(f => <MatchCard key={f.id} fixture={f} />)}
          </div>
        </section>

        {/* Mini leaderboard */}
        {leaderboard && leaderboard.leaderboard.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 rounded-full" style={{ background: '#f5b800' }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Top Predictors
                </span>
              </div>
              <Link
                to="/leaderboard"
                className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
                style={{ color: '#f5b800' }}
              >
                View All →
              </Link>
            </div>

            <div
              className="rounded-xl overflow-hidden"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {leaderboard.leaderboard.slice(0, 5).map((e, i) => {
                const isMe = e.username === user?.username;
                return (
                  <div
                    key={e.user_id}
                    className="flex items-center px-4 py-3 gap-3"
                    style={{
                      borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      background: isMe ? 'rgba(245,184,0,0.04)' : 'transparent',
                      borderLeft: isMe ? '2px solid #f5b800' : '2px solid transparent',
                    }}
                  >
                    <RankBadge rank={e.rank} />
                    <span className="flex-1 text-sm font-bold" style={{ color: isMe ? '#f5b800' : 'rgba(255,255,255,0.8)' }}>
                      {e.username}
                      {isMe && <span className="text-xs ml-1.5 font-normal" style={{ color: 'rgba(255,255,255,0.3)' }}>you</span>}
                    </span>
                    <span className="font-black text-sm mr-3" style={{ color: '#f5b800', fontFamily: '"Bebas Neue", sans-serif', fontSize: '1rem' }}>
                      {e.total_points}
                      <span className="text-xs font-normal ml-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }}>pts</span>
                    </span>
                    <button
                      onClick={() => setViewingUser(e.username)}
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-100 opacity-40"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      title={`View ${e.username}'s picks`}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
      {viewingUser && <UserHistoryModal username={viewingUser} onClose={() => setViewingUser(null)} />}
    </div>
  );
}

