import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useUserStats } from '../hooks/useLeaderboard';

function StatCard({ label, value, sub, accent = false }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div
      className="rounded-xl px-4 py-3.5 flex flex-col gap-1"
      style={{
        background: accent ? 'rgba(245,184,0,0.06)' : 'rgba(255,255,255,0.03)',
        border: accent ? '1px solid rgba(245,184,0,0.2)' : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {label}
      </div>
      <div
        className="font-black leading-none"
        style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.8rem', color: accent ? '#f5b800' : 'rgba(255,255,255,0.9)', letterSpacing: '0.02em' }}
      >
        {value}
      </div>
      {sub && <div className="text-[9px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>{sub}</div>}
    </div>
  );
}

function AccuracyBar({ value }: { value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Accuracy</span>
        <span className="text-xs font-black" style={{ color: '#f5b800' }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: 'linear-gradient(90deg, #16a34a, #f5b800)' }}
        />
      </div>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { data: stats } = useUserStats();

  return (
    <div className="min-h-screen pb-20 sm:pb-8" style={{ background: '#0a0a0a' }}>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Page title */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(245,184,0,0.7)' }}>
            FIFA World Cup 2026
          </div>
          <h1 className="font-black text-white" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', letterSpacing: '0.04em' }}>
            Profile
          </h1>
        </div>

        {/* Player card */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Gold top bar */}
          <div style={{ height: '2px', background: 'linear-gradient(90deg, #f5b800, #16a34a, #f5b800)' }} />

          <div className="px-5 py-5 flex items-center gap-4">
            {/* Avatar */}
            <div
              className="flex items-center justify-center flex-shrink-0 font-black select-none"
              style={{
                width: 64, height: 64,
                borderRadius: '50%',
                background: 'rgba(245,184,0,0.08)',
                border: '2px solid rgba(245,184,0,0.35)',
                boxShadow: '0 0 0 4px rgba(245,184,0,0.06)',
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '1.8rem',
                color: '#f5b800',
              }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div
                className="font-black text-white truncate"
                style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.3rem', letterSpacing: '0.04em' }}
              >
                @{user?.username}
              </div>
              <div className="text-xs font-medium truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {user?.email}
              </div>
              {user?.role === 'admin' && (
                <span
                  className="text-[9px] font-black px-2 py-0.5 rounded-md mt-1.5 inline-block uppercase tracking-widest"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}
                >
                  Admin
                </span>
              )}
            </div>

            {/* Global rank */}
            {stats?.rank && (
              <div className="text-right flex-shrink-0">
                <div
                  className="font-black leading-none"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.2rem', color: '#f5b800' }}
                >
                  #{stats.rank}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Global Rank
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats 2×2 grid */}
        {stats && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard label="Total Points"   value={`${stats.total_points} pts`} accent />
              <StatCard label="Exact Scores"   value={stats.exact_predictions}     accent />
              <StatCard label="Correct Winner" value={stats.winner_predictions} sub="correct result" />
              <StatCard label="Wrong Picks"    value={stats.wrong_predictions}  sub="no points" />
            </div>

            {/* Accuracy bar */}
            <div
              className="rounded-xl px-4 py-4"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <AccuracyBar value={stats.accuracy_percentage} />
              <div className="flex items-center justify-between mt-4 pt-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-center flex-1">
                  <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Total</div>
                  <div className="font-black text-white" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.2rem' }}>{stats.total_predictions}</div>
                </div>
                <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="text-center flex-1">
                  <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Percentile</div>
                  <div className="font-black" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.2rem', color: '#f5b800' }}>Top {100 - stats.percentile}%</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Next milestone */}
        {stats?.next_milestone && (
          <div
            className="rounded-xl px-4 py-3.5"
            style={{ background: 'rgba(245,184,0,0.05)', border: '1px solid rgba(245,184,0,0.18)' }}
          >
            <div className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(245,184,0,0.6)' }}>
              Next Target
            </div>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Need{' '}
              <span className="font-black" style={{ color: '#f5b800' }}>{stats.next_milestone.points_needed} pts</span>
              {' '}to overtake{' '}
              <span className="font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>@{stats.next_milestone.next_rank_username}</span>
              {' '}(#{stats.next_milestone.next_rank_position})
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}


function StatRow({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid rgba(26,58,107,0.5)' }}>
      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6b89b4' }}>{label}</span>
      <span className="font-black text-sm" style={{ color: accent ? '#f5b800' : '#eef2ff' }}>{value}</span>
    </div>
  );
}
