import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AvailableFixture } from '../types';
import { formatKickoffIST, formatStageName, getCountdownParts } from '../utils/timezone';
import { useSubmitPrediction } from '../hooks/usePredictions';
import { useAuth } from '../context/AuthContext';

interface MatchCardProps { fixture: AvailableFixture; }
interface PredictionForm { home: number; away: number; }

const stageStyle: Record<string, { bg: string; text: string }> = {
  group:   { bg: 'rgba(22,163,74,0.2)',  text: '#4ade80' },
  round16: { bg: 'rgba(59,130,246,0.2)', text: '#60a5fa' },
  qf:      { bg: 'rgba(245,158,11,0.2)', text: '#fbbf24' },
  sf:      { bg: 'rgba(239,68,68,0.2)',  text: '#f87171' },
  final:   { bg: 'rgba(245,184,0,0.25)', text: '#f5b800' },
};

function Countdown({ closesAt }: { closesAt: string }) {
  const [parts, setParts] = useState(getCountdownParts(closesAt));
  useEffect(() => {
    const t = setInterval(() => setParts(getCountdownParts(closesAt)), 1000);
    return () => clearInterval(t);
  }, [closesAt]);
  if (parts.expired) return null;
  const display = parts.hours > 0 ? `${parts.hours}h ${parts.minutes}m` : `${parts.minutes}m ${parts.seconds}s`;
  return <span className="font-mono text-xs font-bold" style={{ color: '#f5b800' }}>&#9201; {display}</span>;
}

export function MatchCard({ fixture }: MatchCardProps) {
  const { prediction_window: pw, user_prediction: userPred, status } = fixture;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const submitMutation = useSubmitPrediction();
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<PredictionForm>({
    defaultValues: {
      home: userPred?.predicted_home_goals ?? 0,
      away: userPred?.predicted_away_goals ?? 0,
    },
  });

  const onSubmit = async (data: PredictionForm) => {
    setMsg(null);
    try {
      await submitMutation.mutateAsync({ fixture_id: fixture.id, home: data.home, away: data.away });
      setMsg({ type: 'ok', text: userPred ? 'Prediction updated' : 'Prediction saved' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'err', text: err.response?.data?.error || 'Failed to save' });
    }
  };

  const stg = stageStyle[fixture.stage] || stageStyle.group;
  const isLive = status === 'live';
  const isCompleted = status === 'completed';

  return (
    <div className="rounded-xl overflow-hidden" style={{
      background: 'linear-gradient(135deg,#071428 0%,#0d1f3c 100%)',
      border: isLive ? '1px solid rgba(22,163,74,0.5)' : '1px solid rgba(26,58,107,0.8)',
      boxShadow: isLive ? '0 0 20px rgba(22,163,74,0.1)' : '0 4px 24px rgba(0,0,0,0.4)',
    }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(26,58,107,0.6)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold rounded px-1.5 py-0.5" style={{ background: stg.bg, color: stg.text }}>
            {formatStageName(fixture.stage).toUpperCase()}
          </span>
          <span className="text-xs" style={{ color: '#3d5a80' }}>Match #{fixture.match_number}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isLive && <><span className="live-dot" /><span className="text-xs font-bold uppercase" style={{ color: '#16a34a' }}>Live</span></>}
          {!isLive && !isCompleted && <span className="text-xs" style={{ color: '#3d5a80' }}>{formatKickoffIST(fixture.kickoff_time)}</span>}
          {isCompleted && <span className="text-xs font-bold uppercase" style={{ color: '#3d5a80' }}>Full Time</span>}
        </div>
      </div>

      {/* Teams + Score */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 text-right">
            <div className="font-black text-base sm:text-lg uppercase tracking-wide" style={{ color: '#eef2ff' }}>{fixture.home_team}</div>
          </div>
          <div className="flex items-center gap-1 mx-2">
            {(isCompleted || isLive) && fixture.home_score !== null ? (
              <>
                <span className="font-black text-3xl sm:text-4xl tabular-nums" style={{ color: isCompleted ? '#f5b800' : '#16a34a', textShadow: isCompleted ? '0 0 20px rgba(245,184,0,0.4)' : 'none', minWidth: '1.5ch', textAlign: 'center' }}>{fixture.home_score}</span>
                <span className="font-black text-2xl mx-1" style={{ color: '#3d5a80' }}>-</span>
                <span className="font-black text-3xl sm:text-4xl tabular-nums" style={{ color: isCompleted ? '#f5b800' : '#16a34a', textShadow: isCompleted ? '0 0 20px rgba(245,184,0,0.4)' : 'none', minWidth: '1.5ch', textAlign: 'center' }}>{fixture.away_score}</span>
              </>
            ) : (
              <div className="px-4 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(26,58,107,0.8)' }}>
                <div className="text-xs font-bold uppercase" style={{ color: '#3d5a80' }}>vs</div>
              </div>
            )}
          </div>
          <div className="flex-1 text-left">
            <div className="font-black text-base sm:text-lg uppercase tracking-wide" style={{ color: '#eef2ff' }}>{fixture.away_team}</div>
          </div>
        </div>
        {!isCompleted && !isLive && (
          <div className="text-center mt-2">
            <span className="text-xs" style={{ color: '#3d5a80' }}>{formatKickoffIST(fixture.kickoff_time)}</span>
          </div>
        )}
      </div>

      {/* Prediction zone — hidden for admins */}
      {!isAdmin && (
      <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(26,58,107,0.6)' }}>
        <div className="pt-3">
          {pw.is_open ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex items-end gap-3 justify-center mb-3">
                <div className="text-center">
                  <div className="text-[10px] font-bold uppercase mb-1 truncate max-w-[80px]" style={{ color: '#6b89b4' }}>{fixture.home_team}</div>
                  <input type="number" min={0} max={10}
                    className="w-16 h-14 text-center text-3xl font-black rounded-lg tabular-nums"
                    style={{ background: 'rgba(0,0,0,0.4)', border: '2px solid rgba(245,184,0,0.3)', color: '#f5b800', outline: 'none', WebkitAppearance: 'none' }}
                    {...register('home', { required: true, min: 0, max: 10, valueAsNumber: true })} />
                </div>
                <div className="pb-3 font-black text-2xl" style={{ color: '#3d5a80' }}>-</div>
                <div className="text-center">
                  <div className="text-[10px] font-bold uppercase mb-1 truncate max-w-[80px]" style={{ color: '#6b89b4' }}>{fixture.away_team}</div>
                  <input type="number" min={0} max={10}
                    className="w-16 h-14 text-center text-3xl font-black rounded-lg tabular-nums"
                    style={{ background: 'rgba(0,0,0,0.4)', border: '2px solid rgba(245,184,0,0.3)', color: '#f5b800', outline: 'none', WebkitAppearance: 'none' }}
                    {...register('away', { required: true, min: 0, max: 10, valueAsNumber: true })} />
                </div>
              </div>
              {(errors.home || errors.away) && <p className="text-center text-xs mb-2" style={{ color: '#dc2626' }}>Goals must be 0-10</p>}
              <div className="flex items-center justify-between">
                <Countdown closesAt={fixture.prediction_closes_at} />
                <button type="submit" disabled={submitMutation.isPending}
                  className="px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all disabled:opacity-40 active:scale-95"
                  style={{ background: '#f5b800', color: '#020c1f' }}>
                  {submitMutation.isPending ? '...' : userPred ? 'Update Pick' : 'Lock In Pick'}
                </button>
              </div>
              {msg && <div className="mt-2 text-center text-xs font-bold" style={{ color: msg.type === 'ok' ? '#16a34a' : '#dc2626' }}>{msg.text}</div>}
            </form>
          ) : userPred ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase mb-1" style={{ color: '#3d5a80' }}>Your Prediction</div>
                <div className="font-black text-2xl tabular-nums" style={{ color: '#6b89b4' }}>
                  {userPred.predicted_home_goals} - {userPred.predicted_away_goals}
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: 'rgba(220,38,38,0.15)', color: '#f87171', border: '1px solid rgba(220,38,38,0.3)' }}>CLOSED</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs italic" style={{ color: '#3d5a80' }}>No prediction made</span>
              <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: 'rgba(220,38,38,0.15)', color: '#f87171', border: '1px solid rgba(220,38,38,0.3)' }}>CLOSED</span>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
