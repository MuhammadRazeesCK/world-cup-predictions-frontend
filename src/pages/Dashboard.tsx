import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MatchCard } from '../components/MatchCard';
import { useAvailableFixtures } from '../hooks/useFixtures';
import { useUserStats, useLeaderboard } from '../hooks/useLeaderboard';
import { useAuth } from '../context/AuthContext';

function StatPill({ label, value, gold = false }: { label: string; value: string | number; gold?: boolean }) {
  return (
    <div className="flex-1 text-center rounded-xl py-3 px-2" style={{
      background: gold ? 'rgba(245,184,0,0.08)' : 'rgba(13,31,60,0.8)',
      border: gold ? '1px solid rgba(245,184,0,0.25)' : '1px solid rgba(26,58,107,0.8)',
    }}>
      <div className="font-black text-xl sm:text-2xl" style={{ color: gold ? '#f5b800' : '#eef2ff' }}>{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color: '#3d5a80' }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: available, isLoading, error } = useAvailableFixtures();
  const { data: stats } = useUserStats();
  const { data: leaderboard } = useLeaderboard({ limit: 5 });

  return (
    <div className="min-h-screen pb-20 sm:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-6">

        {/* Hero welcome */}
        <div className="rounded-xl px-5 py-4 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg,#071428 0%,#0d1f3c 60%,#132a50 100%)',
          border: '1px solid rgba(245,184,0,0.2)',
          boxShadow: '0 0 40px rgba(245,184,0,0.06)',
        }}>
          <div className="absolute top-0 right-0 text-8xl opacity-5 font-black select-none pointer-events-none" style={{ lineHeight: 1 }}>⚽</div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f5b800' }}>World Cup 2026</div>
          <div className="font-black text-xl text-text-primary">
            Welcome back, <span style={{ color: '#f5b800' }}>@{user?.username}</span>
          </div>
          <div className="text-xs mt-1" style={{ color: '#6b89b4' }}>Make your predictions before the whistle blows</div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="flex gap-3">
            <StatPill label="Rank" value={stats.rank ? `#${stats.rank}` : '—'} gold />
            <StatPill label="Points" value={stats.total_points} />
            <StatPill label="Accuracy" value={`${stats.accuracy_percentage}%`} />
            <StatPill label="Exact" value={stats.exact_predictions} />
          </div>
        )}

        {/* Upcoming matches */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full" style={{ background: '#f5b800' }} />
            <span className="text-sm font-black uppercase tracking-wide text-text-primary">Upcoming Fixtures</span>
          </div>

          {isLoading && (
            <div className="text-center py-12" style={{ color: '#3d5a80' }}>
              <div className="text-4xl mb-2 animate-pulse">⚽</div>
              <div className="text-xs uppercase tracking-wide">Loading fixtures...</div>
            </div>
          )}
          {error && <div className="text-center py-6 text-xs font-bold uppercase" style={{ color: '#dc2626' }}>Failed to load fixtures</div>}
          {!isLoading && available?.length === 0 && (
            <div className="card text-center py-10">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-sm" style={{ color: '#6b89b4' }}>No fixtures in the next 48 hours</p>
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
                <div className="w-1 h-4 rounded-full" style={{ background: '#f5b800' }} />
                <span className="text-sm font-black uppercase tracking-wide text-text-primary">Top Predictors</span>
              </div>
              <Link to="/leaderboard" className="text-xs font-bold uppercase tracking-wide transition-colors" style={{ color: '#f5b800' }}>View All →</Link>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(26,58,107,0.8)', background: '#071428' }}>
              {leaderboard.leaderboard.slice(0, 5).map((e, i) => {
                const isMe = e.username === user?.username;
                const medals = ['🥇','🥈','🥉'];
                return (
                  <div key={e.user_id} className="flex items-center px-4 py-3 gap-3" style={{
                    borderBottom: i < 4 ? '1px solid rgba(26,58,107,0.5)' : 'none',
                    background: isMe ? 'rgba(245,184,0,0.05)' : 'transparent',
                    borderLeft: isMe ? '3px solid #f5b800' : '3px solid transparent',
                  }}>
                    <span className="text-lg w-8 text-center flex-shrink-0">{e.rank <= 3 ? medals[e.rank-1] : <span className="text-xs font-bold" style={{ color: '#3d5a80' }}>#{e.rank}</span>}</span>
                    <span className="flex-1 text-sm font-bold" style={{ color: isMe ? '#f5b800' : '#eef2ff' }}>
                      {e.username}{isMe && <span className="text-xs ml-1" style={{ color: '#3d5a80' }}>(you)</span>}
                    </span>
                    <span className="font-black text-sm" style={{ color: '#f5b800' }}>{e.total_points} <span className="text-xs font-normal" style={{ color: '#3d5a80' }}>pts</span></span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
