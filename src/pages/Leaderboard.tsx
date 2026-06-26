import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useUserStats } from '../hooks/useLeaderboard';
import { useAuth } from '../context/AuthContext';

const podiumColor = {
  1: { bg: 'rgba(245,184,0,0.08)',    border: 'rgba(245,184,0,0.3)',    glow: 'rgba(245,184,0,0.12)',  badge: '#f5b800',  badgeBg: 'rgba(245,184,0,0.15)',  label: 'GOLD'   },
  2: { bg: 'rgba(200,200,200,0.06)',  border: 'rgba(200,200,200,0.2)',   glow: 'rgba(200,200,200,0.06)', badge: '#d4d4d4',  badgeBg: 'rgba(200,200,200,0.12)', label: 'SILVER' },
  3: { bg: 'rgba(180,100,40,0.07)',   border: 'rgba(180,100,40,0.25)',   glow: 'rgba(180,100,40,0.08)',  badge: '#cd7f32',  badgeBg: 'rgba(180,100,40,0.15)', label: 'BRONZE' },
} as const;

function SpinnerIcon() {
  return (
    <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
      <path d="M12 17c-3.31 0-6-2.69-6-6V5h12v6c0 3.31-2.69 6-6 6z" />
      <path d="M12 17v3M8 20h8" />
    </svg>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const c = podiumColor[rank as 1|2|3] ?? { badge: 'rgba(255,255,255,0.4)', badgeBg: 'rgba(255,255,255,0.05)' };
  return (
    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
      style={{ background: c.badgeBg, color: c.badge }}>
      {rank}
    </span>
  );
}

interface PodiumEntry { rank: number; username: string; total_points: number; accuracy_percentage: number; user_id: string; }

function PodiumCard({ entry, isMe, baseHeight }: { entry: PodiumEntry; isMe: boolean; baseHeight: number }) {
  const c = podiumColor[entry.rank as 1|2|3];
  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Info above the platform */}
      <div className="flex flex-col items-center w-full px-1 mb-2">
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mb-2 flex-shrink-0"
          style={{ background: c.badgeBg, color: c.badge, border: `1px solid ${c.border}` }}
        >
          {entry.rank}
        </span>
        <div className="font-black text-xs uppercase tracking-wide text-center leading-tight mb-1 w-full truncate"
          style={{ color: isMe ? '#f5b800' : 'rgba(255,255,255,0.85)' }}>
          {entry.username}
          {isMe && <span className="block text-[9px] font-bold normal-case" style={{ color: 'rgba(255,255,255,0.35)' }}>you</span>}
        </div>
        <div className="font-black text-center" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.5rem', color: c.badge, lineHeight: 1 }}>
          {entry.total_points}
          <span className="text-xs font-bold ml-0.5" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }}>pts</span>
        </div>
        <div className="text-[9px] font-bold uppercase tracking-wide mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {entry.accuracy_percentage}% acc
        </div>
      </div>
      {/* Podium platform */}
      <div
        className="w-full rounded-t-xl flex items-center justify-center"
        style={{
          height: `${baseHeight}px`,
          background: c.bg,
          border: `1px solid ${c.border}`,
          borderBottom: 'none',
          boxShadow: `0 -4px 20px ${c.glow}`,
        }}
      >
        <span className="font-black text-2xl" style={{ fontFamily: '"Bebas Neue", sans-serif', color: c.badge, opacity: 0.18 }}>
          {entry.rank}
        </span>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useLeaderboard({ limit: 100 });
  const { data: myStats } = useUserStats();

  const top3 = data?.leaderboard.slice(0, 3) ?? [];
  const rest = data?.leaderboard.slice(3) ?? [];

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
            Standings
          </h1>
          {data && (
            <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {data.total_users} players competing
            </p>
          )}
        </div>

        {/* Your rank banner */}
        {myStats?.rank && (
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'rgba(245,184,0,0.06)', border: '1px solid rgba(245,184,0,0.2)' }}
          >
            <span style={{ color: '#f5b800' }}><TrophyIcon /></span>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'rgba(245,184,0,0.6)' }}>
                Your Position
              </div>
              <div className="font-black text-sm text-white">
                Rank <span style={{ color: '#f5b800' }}>#{myStats.rank}</span>
                <span className="font-normal mx-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                {myStats.total_points} pts
                <span className="font-normal mx-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                {myStats.accuracy_percentage}% accuracy
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-14" style={{ color: 'rgba(255,255,255,0.25)' }}>
            <SpinnerIcon />
            <span className="text-xs uppercase tracking-widest font-bold">Loading standings</span>
          </div>
        )}
        {error && (
          <div className="text-center py-6 text-xs font-bold uppercase tracking-wide" style={{ color: '#ef4444' }}>
            Failed to load
          </div>
        )}

        {data && (
          <>
            {/* ── Podium (top 3, or fewer if not enough players) ── */}
            {top3.length > 0 && (
              <div className="flex items-end gap-2">
                {top3.length === 3 ? (
                  // Full podium: 2 | 1 | 3 order, bottom-aligned
                  <>
                    <PodiumCard entry={top3[1]} isMe={top3[1].username === user?.username} baseHeight={80} />
                    <PodiumCard entry={top3[0]} isMe={top3[0].username === user?.username} baseHeight={120} />
                    <PodiumCard entry={top3[2]} isMe={top3[2].username === user?.username} baseHeight={55} />
                  </>
                ) : (
                  // Fewer than 3 players — show in rank order
                  top3.map(e => (
                    <PodiumCard key={e.user_id} entry={e} isMe={e.username === user?.username} baseHeight={90} />
                  ))
                )}
              </div>
            )}

            {/* ── Rows 4+ ── */}
            {rest.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Column headers */}
                <div
                  className="grid px-4 py-2 text-[9px] font-black uppercase tracking-widest"
                  style={{
                    gridTemplateColumns: '2.2rem 1fr 4rem 3.5rem 3.5rem',
                    background: 'rgba(0,0,0,0.35)',
                    color: 'rgba(255,255,255,0.25)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span>#</span>
                  <span>Player</span>
                  <span className="text-right">Pts</span>
                  <span className="text-right hidden sm:block">Exact</span>
                  <span className="text-right">Acc%</span>
                </div>

                {rest.map((e, i) => {
                  const isMe = e.username === user?.username;
                  return (
                    <div
                      key={e.user_id}
                      className="grid items-center px-4 py-2.5"
                      style={{
                        gridTemplateColumns: '2.2rem 1fr 4rem 3.5rem 3.5rem',
                        borderBottom: i < rest.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        background: isMe ? 'rgba(245,184,0,0.04)' : 'transparent',
                        borderLeft: isMe ? '2px solid #f5b800' : '2px solid transparent',
                      }}
                    >
                      <RankBadge rank={e.rank} />
                      <span className="font-bold text-sm truncate pl-1" style={{ color: isMe ? '#f5b800' : 'rgba(255,255,255,0.8)' }}>
                        {e.username}
                        {isMe && <span className="text-xs ml-1.5 font-normal" style={{ color: 'rgba(255,255,255,0.25)' }}>you</span>}
                      </span>
                      <span className="text-right font-black text-sm" style={{ color: '#f5b800', fontFamily: '"Bebas Neue", sans-serif', fontSize: '1rem' }}>
                        {e.total_points}
                      </span>
                      <span className="text-right text-xs hidden sm:block" style={{ color: '#4ade80' }}>
                        {e.exact_predictions}
                      </span>
                      <span className="text-right text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {e.accuracy_percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

