import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useUserStats } from '../hooks/useLeaderboard';
import { usersApi } from '../api/users';

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
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { data: meData } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => usersApi.getMe().then((r: { data: { id: string; username: string; email: string; role: string; avatar_url: string | null } }) => r.data),
    staleTime: 60_000,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: () => { setPreview(null); qc.invalidateQueries({ queryKey: ['users', 'me'] }); qc.invalidateQueries({ queryKey: ['leaderboard'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => usersApi.deleteAvatar(),
    onSuccess: () => { setPreview(null); qc.invalidateQueries({ queryKey: ['users', 'me'] }); qc.invalidateQueries({ queryKey: ['leaderboard'] }); },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const currentAvatar = preview ?? meData?.avatar_url ?? null;

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
            <div className="relative flex-shrink-0">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="block relative"
                title="Change photo"
              >
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt="avatar"
                    className="rounded-full object-cover"
                    style={{ width: 64, height: 64, border: '2px solid rgba(245,184,0,0.35)', boxShadow: '0 0 0 4px rgba(245,184,0,0.06)' }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center font-black select-none"
                    style={{
                      width: 64, height: 64, borderRadius: '50%',
                      background: 'rgba(245,184,0,0.08)',
                      border: '2px solid rgba(245,184,0,0.35)',
                      boxShadow: '0 0 0 4px rgba(245,184,0,0.06)',
                      fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.8rem', color: '#f5b800',
                    }}
                  >
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                )}
                {/* Camera overlay */}
                <span className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </span>
              </button>
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

        {/* Avatar save / cancel / remove buttons */}
        {preview && (
          <div className="flex gap-2">
            <button
              onClick={() => { const file = fileInputRef.current?.files?.[0]; if (file) uploadMutation.mutate(file); }}
              disabled={uploadMutation.isPending}
              className="flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-opacity disabled:opacity-50"
              style={{ background: '#f5b800', color: '#0a0a0a' }}
            >
              {uploadMutation.isPending ? 'Saving…' : 'Save Photo'}
            </button>
            <button
              onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Cancel
            </button>
          </div>
        )}
        {!preview && meData?.avatar_url && (
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-100 opacity-50 disabled:opacity-30"
            style={{ color: '#ef4444' }}
          >
            {deleteMutation.isPending ? 'Removing…' : '✕ Remove photo'}
          </button>
        )}

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
