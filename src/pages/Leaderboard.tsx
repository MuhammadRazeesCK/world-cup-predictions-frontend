import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useUserStats } from '../hooks/useLeaderboard';
import { useAuth } from '../context/AuthContext';

const medals = ['🥇','🥈','🥉'];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useLeaderboard({ limit: 100 });
  const { data: myStats } = useUserStats();

  return (
    <div className="min-h-screen pb-20 sm:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f5b800' }}>World Cup 2026</div>
          <h1 className="font-black text-2xl text-text-primary">Standings</h1>
          {data && <p className="text-xs mt-1" style={{ color: '#6b89b4' }}>{data.total_users} players competing</p>}
        </div>

        {/* Your rank banner */}
        {myStats?.rank && (
          <div className="rounded-xl px-4 py-3 flex items-center gap-4" style={{
            background: 'rgba(245,184,0,0.07)',
            border: '1px solid rgba(245,184,0,0.25)',
          }}>
            <div className="text-3xl">🏅</div>
            <div>
              <div className="text-xs font-bold uppercase" style={{ color: '#f5b800' }}>Your Position</div>
              <div className="font-black text-text-primary">Rank #{myStats.rank} · {myStats.total_points} pts · {myStats.accuracy_percentage}% accuracy</div>
            </div>
          </div>
        )}

        {isLoading && <div className="text-center py-12"><div className="text-4xl animate-pulse">⏳</div></div>}
        {error && <div className="text-center py-6 text-xs font-bold uppercase" style={{ color: '#dc2626' }}>Failed to load</div>}

        {data && (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(26,58,107,0.8)', background: '#071428' }}>
            {/* Header row */}
            <div className="grid px-4 py-2 text-[10px] font-black uppercase tracking-widest" style={{
              gridTemplateColumns: '2rem 1fr 4rem 3rem 3rem',
              background: 'rgba(0,0,0,0.4)',
              color: '#3d5a80',
              borderBottom: '1px solid rgba(26,58,107,0.8)',
            }}>
              <span>#</span><span>Player</span><span className="text-right">Pts</span><span className="text-right hidden sm:block">Exact</span><span className="text-right">Acc%</span>
            </div>
            {data.leaderboard.map((e, i) => {
              const isMe = e.username === user?.username;
              return (
                <div key={e.user_id} className="grid items-center px-4 py-3 gap-0" style={{
                  gridTemplateColumns: '2rem 1fr 4rem 3rem 3rem',
                  borderBottom: i < data.leaderboard.length - 1 ? '1px solid rgba(26,58,107,0.4)' : 'none',
                  background: isMe ? 'rgba(245,184,0,0.06)' : 'transparent',
                  borderLeft: isMe ? '3px solid #f5b800' : '3px solid transparent',
                }}>
                  <span className="text-sm">
                    {e.rank <= 3 ? medals[e.rank-1] : <span className="font-bold text-xs" style={{ color: '#3d5a80' }}>{e.rank}</span>}
                  </span>
                  <span className="font-bold text-sm truncate" style={{ color: isMe ? '#f5b800' : '#eef2ff' }}>
                    {e.username}
                    {isMe && <span className="text-xs ml-1 font-normal" style={{ color: '#3d5a80' }}>(you)</span>}
                  </span>
                  <span className="text-right font-black text-sm" style={{ color: '#f5b800' }}>{e.total_points}</span>
                  <span className="text-right text-xs hidden sm:block" style={{ color: '#16a34a' }}>{e.exact_predictions}</span>
                  <span className="text-right text-xs" style={{ color: '#6b89b4' }}>{e.accuracy_percentage}%</span>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
