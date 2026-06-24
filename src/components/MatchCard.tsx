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

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 inline-block" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function GoalStepper({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled || value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 rounded-lg font-black text-lg flex items-center justify-center transition-all active:scale-90 disabled:opacity-25"
        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        −
      </button>
      <span
        className="tabular-nums min-w-[2ch] text-center"
        style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', color: '#f5b800', lineHeight: 1, letterSpacing: '0.02em' }}
      >
        {value}
      </span>
      <button
        type="button"
        disabled={disabled || value >= 10}
        onClick={() => onChange(Math.min(10, value + 1))}
        className="w-8 h-8 rounded-lg font-black text-lg flex items-center justify-center transition-all active:scale-90 disabled:opacity-25"
        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        +
      </button>
    </div>
  );
}

const stageStyle: Record<string, { bg: string; text: string }> = {
  group:   { bg: 'rgba(22,163,74,0.15)',  text: '#4ade80' },
  round16: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
  qf:      { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  sf:      { bg: 'rgba(239,68,68,0.15)',  text: '#f87171' },
  final:   { bg: 'rgba(245,184,0,0.18)',  text: '#f5b800' },
};

function Countdown({ closesAt }: { closesAt: string }) {
  const [parts, setParts] = useState(getCountdownParts(closesAt));
  useEffect(() => {
    const t = setInterval(() => setParts(getCountdownParts(closesAt)), 1000);
    return () => clearInterval(t);
  }, [closesAt]);
  if (parts.expired) return null;
  const display = parts.hours > 0 ? `${parts.hours}h ${parts.minutes}m` : `${parts.minutes}m ${parts.seconds}s`;
  return (
    <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#f5b800' }}>
      <ClockIcon /> {display}
    </span>
  );
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
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: '#111111',
        border: isLive ? '1px solid rgba(22,163,74,0.4)' : '1px solid rgba(255,255,255,0.07)',
        boxShadow: isLive ? '0 0 20px rgba(22,163,74,0.08)' : 'none',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold rounded-md px-2 py-0.5 uppercase tracking-wide" style={{ background: stg.bg, color: stg.text }}>
            {formatStageName(fixture.stage)}
          </span>
          <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            #{fixture.match_number}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isLive && (
            <><span className="live-dot" /><span className="text-[10px] font-black uppercase tracking-wide" style={{ color: '#16a34a' }}>Live</span></>
          )}
          {!isLive && !isCompleted && (
            <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {formatKickoffIST(fixture.kickoff_time)}
            </span>
          )}
          {isCompleted && (
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Full Time
            </span>
          )}
        </div>
      </div>

      {/* Teams + Score */}
      <div className="px-4 py-3.5">
        <div className="flex items-center justify-center gap-3">

          {/* Home */}
          <div className="flex flex-col items-center gap-2" style={{ width: '38%' }}>
            <TeamFlag name={fixture.home_team} className="w-12 h-8 rounded-md shadow-lg" />
            <div className="font-black text-xs uppercase tracking-wide text-center leading-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {fixture.home_team}
            </div>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-1.5 shrink-0" style={{ width: '24%' }}>
            {(isCompleted || isLive) && fixture.home_score !== null ? (
              <>
                <div className="flex items-center gap-1">
                  <span
                    className="tabular-nums w-8 text-center"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.9rem', lineHeight: 1, color: isCompleted ? '#f5b800' : '#4ade80' }}
                  >
                    {fixture.home_score}
                  </span>
                  <span className="font-black text-base" style={{ color: 'rgba(255,255,255,0.2)' }}>:</span>
                  <span
                    className="tabular-nums w-8 text-center"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.9rem', lineHeight: 1, color: isCompleted ? '#f5b800' : '#4ade80' }}
                  >
                    {fixture.away_score}
                  </span>
                </div>
                {(() => {
                  const r = resultLabel(fixture.home_score!, fixture.away_score!, fixture.home_team, fixture.away_team);
                  return (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-center"
                      style={{ background: `${r.color}18`, color: r.color, border: `1px solid ${r.color}40` }}>
                      {r.text}
                    </span>
                  );
                })()}
              </>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <div className="px-3 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.1rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>VS</span>
                </div>
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-2" style={{ width: '38%' }}>
            <TeamFlag name={fixture.away_team} className="w-12 h-8 rounded-md shadow-lg" />
            <div className="font-black text-xs uppercase tracking-wide text-center leading-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {fixture.away_team}
            </div>
          </div>

        </div>
      </div>

      {/* Prediction zone */}
      {!isAdmin && (
        <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="pt-3">
            {pw.is_open && !isLive ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Stepper row */}
                <div className="flex items-center justify-center gap-5 mb-3">
                  <GoalStepper value={homeVal ?? 0} onChange={(v) => setValue('home', v)} />
                  <span className="font-black text-lg" style={{ color: 'rgba(255,255,255,0.15)', lineHeight: 1 }}>–</span>
                  <GoalStepper value={awayVal ?? 0} onChange={(v) => setValue('away', v)} />
                </div>

                {/* Result preview pill */}
                {(() => {
                  const r = resultLabel(homeVal ?? 0, awayVal ?? 0, fixture.home_team, fixture.away_team);
                  return (
                    <div className="text-center mb-3">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={{ background: `${r.color}15`, color: r.color, border: `1px solid ${r.color}35` }}>
                        {r.text}
                      </span>
                    </div>
                  );
                })()}

                {/* Submit row */}
                <div className="flex items-center justify-between gap-3">
                  <Countdown closesAt={fixture.prediction_closes_at} />
                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40 active:scale-95"
                    style={{ background: '#f5b800', color: '#0a0a0a' }}
                  >
                    {submitMutation.isPending ? 'Saving…' : userPred ? 'Update' : 'Submit'}
                  </button>
                </div>
                {msg && (
                  <div className="mt-2 text-center text-xs font-bold tracking-wide" style={{ color: msg.type === 'ok' ? '#4ade80' : '#f87171' }}>
                    {msg.text}
                  </div>
                )}
              </form>
            ) : userPred ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Your Prediction
                  </div>
                  <div className="font-black tabular-nums" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>
                    {userPred.predicted_home_goals} – {userPred.predicted_away_goals}
                  </div>
                </div>
                <span className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                  Closed
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  No prediction made
                </span>
                <span className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                  Closed
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

