import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MatchCard } from '../components/MatchCard';
import { PlayerPredictionsModal, EyeIcon } from '../components/PlayerPredictionsModal';
import { useAvailableFixtures } from '../hooks/useFixtures';
import { useUserStats, useLeaderboard } from '../hooks/useLeaderboard';
import { useAuth } from '../context/AuthContext';
import { announcementsApi } from '../api/announcements';
import { pollsApi } from '../api/polls';

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

export default function Dashboard() {
  const { user } = useAuth();
  const { data: available, isLoading, error } = useAvailableFixtures();
  const { data: stats } = useUserStats();
  const { data: leaderboard } = useLeaderboard({ limit: 5 });
  const [viewingUser, setViewingUser] = useState<string | null>(null);

  // Live polls indicator: polls the user hasn't voted on yet
  const { data: livePolls = [] } = useQuery({
    queryKey: ['polls'],
    queryFn: pollsApi.getPolls,
    staleTime: 60_000,
  });
  const unvotedPolls = livePolls.filter((p) => !p.isClosed && p.userVote === null);

  // Announcement banner (shown before fixture posters)
  const { data: announcement } = useQuery({
    queryKey: ['announcement'],
    queryFn: announcementsApi.getCurrent,
    staleTime: 60_000,
  });
  const announcementKey = announcement ? `announcement_dismissed_${announcement.id}_${String(announcement.image_url ?? announcement.message).slice(-12)}` : null;
  const [announcementVersion, setAnnouncementVersion] = useState(0);
  const showAnnouncement = !!announcement && announcementVersion >= 0 && announcementKey
    ? !localStorage.getItem(announcementKey)
    : false;
  function dismissAnnouncement() {
    if (announcementKey) localStorage.setItem(announcementKey, '1');
    setAnnouncementVersion(v => v + 1);
  }

  // Poster banner: show each fixture poster in turn, skip already-dismissed ones
  const [posterVersion, setPosterVersion] = useState(0);
  const posterFixture = (() => {
    return available?.find(f => {
      if (!f.poster_url) return false;
      if (f.status === 'completed') return false;
      const key = `poster_dismissed_${f.id}_${f.poster_url.slice(-12)}`;
      return !localStorage.getItem(key);
    });
  })();
  // Re-evaluate when available data loads (posterVersion forces re-render after dismiss)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const showPoster = !!posterFixture && posterVersion >= 0;

  function dismissPoster() {
    if (!posterFixture?.poster_url) return;
    const key = `poster_dismissed_${posterFixture.id}_${posterFixture.poster_url.slice(-12)}`;
    localStorage.setItem(key, '1');
    setPosterVersion(v => v + 1); // force re-evaluation → next undismissed poster
  }

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

        {/* Live polls banner */}
        {unvotedPolls.length > 0 && (
          <Link
            to="/polls"
            className="flex items-center justify-between rounded-xl px-4 py-3 transition-all"
            style={{
              background: 'rgba(245,184,0,0.07)',
              border: '1px solid rgba(245,184,0,0.25)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🗳️</span>
              <div>
                <p className="text-sm font-bold text-white">
                  {unvotedPolls.length} poll{unvotedPolls.length > 1 ? 's' : ''} happening right now!
                </p>
                <p className="text-xs" style={{ color: 'rgba(245,184,0,0.7)' }}>
                  {unvotedPolls[0].question}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0" style={{ background: '#f5b800', color: '#000' }}>
              Vote Now →
            </span>
          </Link>
        )}

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
                      <EyeIcon />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
      {viewingUser && <PlayerPredictionsModal username={viewingUser} onClose={() => setViewingUser(null)} />}

      {/* Announcement Banner — shown before fixture posters */}
      {showAnnouncement && announcement && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.88)', zIndex: 55 }}
          onClick={dismissAnnouncement}
        >
          <div
            className="relative mx-4 space-y-3"
            style={{ maxWidth: '420px', width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            {announcement.image_url && (
              <img
                src={announcement.image_url}
                alt="Announcement"
                className="w-full rounded-2xl shadow-2xl"
                style={{ display: 'block' }}
              />
            )}
            {announcement.message && (
              <div
                className="rounded-xl px-5 py-4 text-sm font-medium text-center leading-relaxed"
                style={{ background: '#111', border: '1px solid rgba(245,184,0,0.25)', color: 'rgba(255,255,255,0.85)', borderLeft: '3px solid #f5b800' }}
              >
                {announcement.message}
              </div>
            )}
            <button
              onClick={dismissAnnouncement}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-opacity hover:opacity-80"
              style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Match Poster Banner */}
      {!showAnnouncement && showPoster && posterFixture && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)', zIndex: 50 }}
          onClick={dismissPoster}
        >
          <div
            className="relative mx-4"
            style={{ maxWidth: '420px', width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={posterFixture.poster_url!}
              alt={`${posterFixture.home_team} vs ${posterFixture.away_team}`}
              className="w-full rounded-2xl shadow-2xl"
              style={{ display: 'block' }}
            />
            <button
              onClick={dismissPoster}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-opacity hover:opacity-80"
              style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

