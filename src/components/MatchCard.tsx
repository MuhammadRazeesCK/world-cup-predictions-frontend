import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AvailableFixture } from '../types';
import { formatKickoffIST, formatStageName, getCountdownParts } from '../utils/timezone';
import { useSubmitPrediction } from '../hooks/usePredictions';
import { useAuth } from '../context/AuthContext';
import { TeamFlag } from '../utils/teams';

interface MatchCardProps { fixture: AvailableFixture; }
interface PredictionForm { home: number; away: number; }

function resultLabel(home: number, away: number, homeTeam: string, awayTeam: string) {
  if (home > away) return { text: `${homeTeam} Win`, color: '#4ade80' };
  if (away > home) return { text: `${awayTeam} Win`, color: '#f87171' };
  return { text: 'Draw', color: '#fbbf24' };
}

function GoalStepper({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={disabled || value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 rounded-lg font-black text-lg flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
        style={{ background: 'rgba(255,255,255,0.08)', color: '#eef2ff', border: '1px solid rgba(255,255,255,0.1)' }}>
        −
      </button>
      <span className="font-black text-3xl tabular-nums min-w-[1.8ch] text-center" style={{ color: '#f5b800' }}>{value}</span>
      <button type="button" disabled={disabled || value >= 10}
        onClick={() => onChange(Math.min(10, value + 1))}
        className="w-8 h-8 rounded-lg font-black text-lg flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
        style={{ background: 'rgba(255,255,255,0.08)', color: '#eef2ff', border: '1px solid rgba(255,255,255,0.1)' }}>
        +
      </button>
    </div>
  );
}

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

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<PredictionForm>({
    defaultValues: {
      home: userPred?.predicted_home_goals ?? 0,
      away: userPred?.predicted_away_goals ?? 0,
    },
  });

  const homeVal = useWatch({ control, name: 'home' });
  const awayVal = useWatch({ control, name: 'away' });

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
      <div className="px-4 py-5">
        <div className="flex items-center justify-center gap-3">

          {/* Home team — centered column */}
          <div className="flex flex-col items-center gap-1.5" style={{ width: '38%' }}>
            <TeamFlag name={fixture.home_team} className="w-12 h-8 rounded-md shadow-md" />
            <div className="font-black text-sm sm:text-base uppercase tracking-wide text-center leading-tight" style={{ color: '#eef2ff' }}>
              {fixture.home_team}
            </div>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-1 shrink-0" style={{ width: '24%' }}>
            {(isCompleted || isLive) && fixture.home_score !== null ? (
              <>
                <div className="flex items-center gap-1">
                  <span className="font-black text-3xl sm:text-4xl tabular-nums w-8 text-center"
                    style={{ color: isCompleted ? '#f5b800' : '#16a34a', textShadow: isCompleted ? '0 0 20px rgba(245,184,0,0.4)' : 'none' }}>
                    {fixture.home_score}
                  </span>
                  <span className="font-black text-xl" style={{ color: '#3d5a80' }}>:</span>
                  <span className="font-black text-3xl sm:text-4xl tabular-nums w-8 text-center"
                    style={{ color: isCompleted ? '#f5b800' : '#16a34a', textShadow: isCompleted ? '0 0 20px rgba(245,184,0,0.4)' : 'none' }}>
                    {fixture.away_score}
                  </span>
                </div>
                {(() => {
                  const r = resultLabel(fixture.home_score!, fixture.away_score!, fixture.home_team, fixture.away_team);
                  return (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-center"
                      style={{ background: 'rgba(0,0,0,0.35)', color: r.color, border: `1px solid ${r.color}50` }}>
                      {r.text}
                    </span>
                  );
                })()}
              </>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(26,58,107,0.8)' }}>
                  <span className="font-black text-sm uppercase tracking-widest" style={{ color: '#3d5a80' }}>VS</span>
                </div>
                <span className="text-[10px] text-center" style={{ color: '#3d5a80' }}>{formatKickoffIST(fixture.kickoff_time)}</span>
              </div>
            )}
          </div>

          {/* Away team — centered column */}
          <div className="flex flex-col items-center gap-1.5" style={{ width: '38%' }}>
            <TeamFlag name={fixture.away_team} className="w-12 h-8 rounded-md shadow-md" />
            <div className="font-black text-sm sm:text-base uppercase tracking-wide text-center leading-tight" style={{ color: '#eef2ff' }}>
              {fixture.away_team}
            </div>
          </div>

        </div>
      </div>

      {/* Prediction zone — hidden for admins */}
      {!isAdmin && (
      <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(26,58,107,0.6)' }}>
        <div className="pt-3">
          {pw.is_open && !isLive ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex items-center gap-3 justify-center mb-2">
                <div className="text-center">
                  <div className="text-[10px] font-bold uppercase mb-2 truncate max-w-[80px]" style={{ color: '#6b89b4' }}>
                    <TeamFlag name={fixture.home_team} className="w-4 h-3 rounded-sm inline-block mr-0.5" /> {fixture.home_team}
                  </div>
                  <GoalStepper value={homeVal ?? 0} onChange={(v) => setValue('home', v)} />
                </div>
                <div className="pb-1 font-black text-2xl" style={{ color: '#3d5a80' }}>-</div>
                <div className="text-center">
                  <div className="text-[10px] font-bold uppercase mb-2 truncate max-w-[80px]" style={{ color: '#6b89b4' }}>
                    <TeamFlag name={fixture.away_team} className="w-4 h-3 rounded-sm inline-block mr-0.5" /> {fixture.away_team}
                  </div>
                  <GoalStepper value={awayVal ?? 0} onChange={(v) => setValue('away', v)} />
                </div>
              </div>
              {/* Live result preview */}
              {(() => {
                const r = resultLabel(homeVal ?? 0, awayVal ?? 0, fixture.home_team, fixture.away_team);
                return (
                  <div className="text-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.3)', color: r.color, border: `1px solid ${r.color}30` }}>
                      {r.text}
                    </span>
                  </div>
                );
              })()}
              <div className="flex items-center justify-between">
                <Countdown closesAt={fixture.prediction_closes_at} />
                <button type="submit" disabled={submitMutation.isPending}
                  className="px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all disabled:opacity-40 active:scale-95"
                  style={{ background: '#f5b800', color: '#020c1f' }}>
                  {submitMutation.isPending ? '...' : userPred ? '✏️ Update Prediction' : '⚽ Submit Prediction'}
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
