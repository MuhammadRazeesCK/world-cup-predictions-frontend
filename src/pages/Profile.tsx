import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useUserStats } from '../hooks/useLeaderboard';

function StatRow({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid rgba(26,58,107,0.5)' }}>
      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6b89b4' }}>{label}</span>
      <span className="font-black text-sm" style={{ color: accent ? '#f5b800' : '#eef2ff' }}>{value}</span>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { data: stats } = useUserStats();

  return (
    <div className="min-h-screen pb-20 sm:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f5b800' }}>World Cup 2026</div>
          <h1 className="font-black text-2xl text-text-primary">Profile</h1>
        </div>

        {/* Player card */}
        <div className="rounded-xl overflow-hidden" style={{
          background: 'linear-gradient(135deg,#071428 0%,#0d1f3c 100%)',
          border: '1px solid rgba(245,184,0,0.2)',
          boxShadow: '0 0 30px rgba(245,184,0,0.06)',
        }}>
          <div className="h-1" style={{ background: 'linear-gradient(90deg,#f5b800,#16a34a,#3b82f6)' }} />
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0" style={{
              background: 'rgba(245,184,0,0.1)', border: '2px solid rgba(245,184,0,0.3)', color: '#f5b800',
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-black text-lg text-text-primary">@{user?.username}</div>
              <div className="text-xs" style={{ color: '#6b89b4' }}>{user?.email}</div>
              {user?.role === 'admin' && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded mt-1 inline-block" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>ADMIN</span>
              )}
            </div>
            {stats?.rank && (
              <div className="ml-auto text-right">
                <div className="font-black text-3xl" style={{ color: '#f5b800' }}>#{stats.rank}</div>
                <div className="text-[10px] font-bold uppercase" style={{ color: '#3d5a80' }}>Global Rank</div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="card">
            <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#f5b800' }}>Performance Stats</div>
            <StatRow label="Total Points" value={`${stats.total_points} pts`} accent />
            <StatRow label="Accuracy" value={`${stats.accuracy_percentage}%`} />
            <StatRow label="Total Predictions" value={stats.total_predictions} />
            <StatRow label="Exact Scores" value={stats.exact_predictions} accent />
            <StatRow label="Correct Winner" value={stats.winner_predictions} />
            <StatRow label="Wrong Predictions" value={stats.wrong_predictions} />
            <div className="flex items-center justify-between pt-2.5">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6b89b4' }}>Percentile</span>
              <span className="font-black text-sm" style={{ color: '#eef2ff' }}>Top {100 - stats.percentile}%</span>
            </div>
          </div>
        )}

        {/* Next milestone */}
        {stats?.next_milestone && (
          <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(245,184,0,0.06)', border: '1px solid rgba(245,184,0,0.2)' }}>
            <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#f5b800' }}>Next Target</div>
            <p className="text-sm" style={{ color: '#6b89b4' }}>
              Need <span className="font-black" style={{ color: '#f5b800' }}>{stats.next_milestone.points_needed} pts</span> to overtake <span className="font-bold text-text-primary">@{stats.next_milestone.next_rank_username}</span> (#{stats.next_milestone.next_rank_position})
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
