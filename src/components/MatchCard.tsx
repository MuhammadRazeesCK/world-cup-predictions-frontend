import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { AvailableFixture } from '../types';
import { formatKickoffIST, formatStageName, getCountdownParts } from '../utils/timezone';
import { useSubmitPrediction } from '../hooks/usePredictions';
import { useAuth } from '../context/AuthContext';
import { TeamFlag } from '../utils/teams';
import apiClient from '../api/client';

interface MatchCardProps { fixture: AvailableFixture; }
interface PredictionForm { home: number; away: number; pen_home: number; pen_away: number; }

function resultLabel(
  home: number, away: number, homeTeam: string, awayTeam: string,
  live = false, penHome?: number | null, penAway?: number | null,
) {
  if (home > away) return { text: live ? `${homeTeam} Leading` : `${homeTeam} Win`, color: '#4ade80' };
  if (away > home) return { text: live ? `${awayTeam} Leading` : `${awayTeam} Win`, color: '#f87171' };
  // Regular score is a draw — check penalty winner
  if (!live && penHome != null && penAway != null && penHome !== penAway) {
    const penWinner = penHome > penAway ? homeTeam : awayTeam;
    const penColor = penHome > penAway ? '#4ade80' : '#f87171';
    return { text: `${penWinner} Win (Pens)`, color: penColor };
  }
  return { text: live ? 'Level' : 'Draw', color: '#fbbf24' };
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
  group:       { bg: 'rgba(22,163,74,0.15)',  text: '#4ade80' },
  round32:     { bg: 'rgba(14,165,233,0.15)', text: '#38bdf8' },
  round16:     { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
  qf:          { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  sf:          { bg: 'rgba(239,68,68,0.15)',  text: '#f87171' },
  third_place: { bg: 'rgba(168,85,247,0.15)', text: '#c084fc' },
  final:       { bg: 'rgba(245,184,0,0.18)',  text: '#f5b800' },
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

interface LiveData {
  clock: string | null;
  state: string;
  scorers: { name: string; minute: string; team: 'home' | 'away'; isOwnGoal: boolean; isPenalty: boolean }[];
}

function useLiveData(fixtureId: string, isLive: boolean, isCompleted: boolean) {
  return useQuery<LiveData>({
    queryKey: ['live-data', fixtureId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/fixtures/${fixtureId}/live-data`);
      return data;
    },
    enabled: isLive || isCompleted,
    refetchInterval: isLive ? 30_000 : false, // only poll during live
    staleTime: isLive ? 25_000 : Infinity,    // completed data never goes stale
  });
}

function ScorersList({ scorers, homeTeam, awayTeam }: { scorers: LiveData['scorers']; homeTeam: string; awayTeam: string }) {
  if (!scorers.length) return null;
  const home = scorers.filter((s) => s.team === 'home');
  const away = scorers.filter((s) => s.team === 'away');
  return (
    <div className="flex justify-between px-4 pb-3 gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex flex-col gap-0.5 pt-2 text-left" style={{ width: '45%' }}>
        {home.map((s, i) => (
          <span key={i} className="text-[10px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>
            ⚽ {s.name}{s.isOwnGoal ? ' (og)' : s.isPenalty ? ' (p)' : ''} <span style={{ color: 'rgba(255,255,255,0.3)' }}>{s.minute}</span>
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-0.5 pt-2 text-right" style={{ width: '45%' }}>
        {away.map((s, i) => (
          <span key={i} className="text-[10px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>{s.minute}</span> {s.name}{s.isOwnGoal ? ' (og)' : s.isPenalty ? ' (p)' : ''} ⚽
          </span>
        ))}
      </div>
    </div>
  );
}

export function MatchCard({ fixture }: MatchCardProps) {
  const { prediction_window: pw, user_prediction: userPred, status } = fixture;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const submitMutation = useSubmitPrediction();
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [showStream, setShowStream] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<PredictionForm>({
    defaultValues: {
      home: userPred?.predicted_home_goals ?? 0,
      away: userPred?.predicted_away_goals ?? 0,
      pen_home: userPred?.penalty_home_goals ?? 0,
      pen_away: userPred?.penalty_away_goals ?? 0,
    },
  });

  const homeVal = useWatch({ control, name: 'home' });
  const awayVal = useWatch({ control, name: 'away' });
  const penHomeVal = useWatch({ control, name: 'pen_home' });
  const penAwayVal = useWatch({ control, name: 'pen_away' });

  const onSubmit = async (data: PredictionForm) => {
    setMsg(null);
    try {
      const sendPen = isKnockout && data.home === data.away && fixture.penalty_enabled;
      await submitMutation.mutateAsync({
        fixture_id: fixture.id,
        home: data.home,
        away: data.away,
        ...(sendPen && { pen_home: data.pen_home, pen_away: data.pen_away }),
      });
      setMsg({ type: 'ok', text: userPred ? 'Prediction updated' : 'Prediction saved' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'err', text: err.response?.data?.error || 'Failed to save' });
    }
  };

  const stg = stageStyle[fixture.stage] || stageStyle.group;
  const isLive = status === 'live';
  const isCompleted = status === 'completed';
  const isKnockout = fixture.stage !== 'group';
  const isDrawPrediction = isKnockout && (homeVal ?? 0) === (awayVal ?? 0);
  const isPenDrawInvalid = isDrawPrediction && fixture.penalty_enabled && (penHomeVal ?? 0) === (penAwayVal ?? 0);

  const { data: liveData } = useLiveData(fixture.id, isLive && !!fixture.api_fixture_id, isCompleted && !!fixture.api_fixture_id);

  return (
    <div
      className="rounded-xl overflow-hidden relative"
      style={{
        background: '#0d0d0d',
        border: isLive ? '1px solid rgba(22,163,74,0.4)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isLive ? '0 0 20px rgba(22,163,74,0.08)' : 'none',
      }}
    >
      {/* Poster spotlight glows */}
      {!isCompleted && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 15% 40%, rgba(180,120,0,0.18) 0%, transparent 55%)', pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 85% 40%, rgba(140,20,20,0.15) 0%, transparent 55%)', pointerEvents: 'none', zIndex: 0 }} />
        </>
      )}
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2 relative"
        style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 1 }}
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
            <><span className="live-dot" /><span className="text-[10px] font-black uppercase tracking-wide" style={{ color: '#16a34a' }}>Live</span>
            {liveData?.clock && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(22,163,74,0.15)', color: '#4ade80' }}>
                {liveData.clock}
              </span>
            )}
            </>
          )}
          {isLive && fixture.stream_url && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowStream((v) => !v); }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wide transition-all"
              style={{
                background: showStream ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.9)',
                color: '#fff',
                animation: showStream ? 'none' : 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
              }}
            >
              {showStream ? '✕ Close' : '▶ Watch'}
            </button>
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
      <div className="px-4 py-5 relative" style={{ zIndex: 1 }}>
        <div className="flex items-center justify-center gap-3">

          {/* Home */}
          <div className="flex flex-col items-center gap-2.5" style={{ width: '38%' }}>
            <TeamFlag name={fixture.home_team} className="w-14 h-10 rounded-md shadow-lg" />
            <div className="font-black text-sm uppercase tracking-wide text-center leading-tight" style={{ color: '#ffffff', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.06em' }}>
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
                    style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.2rem', lineHeight: 1, color: isCompleted ? '#f5b800' : '#4ade80' }}
                  >
                    {fixture.home_score}
                  </span>
                  <span className="font-black text-base" style={{ color: 'rgba(255,255,255,0.2)' }}>:</span>
                  <span
                    className="tabular-nums w-8 text-center"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.2rem', lineHeight: 1, color: isCompleted ? '#f5b800' : '#4ade80' }}
                  >
                    {fixture.away_score}
                  </span>
                </div>
                {(() => {
                  const r = resultLabel(fixture.home_score!, fixture.away_score!, fixture.home_team, fixture.away_team, isLive, fixture.penalty_home_score, fixture.penalty_away_score);
                  return (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-center"
                      style={{ background: `${r.color}18`, color: r.color, border: `1px solid ${r.color}40` }}>
                      {r.text}
                    </span>
                  );
                })()}
                {/* Penalty shootout score */}
                {isCompleted && fixture.penalty_home_score != null && fixture.penalty_away_score != null && (
                  <span className="text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    ({fixture.penalty_home_score} – {fixture.penalty_away_score} pens)
                  </span>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <div className="px-4 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.3rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em' }}>VS</span>
                </div>
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-2.5" style={{ width: '38%' }}>
            <TeamFlag name={fixture.away_team} className="w-14 h-10 rounded-md shadow-lg" />
            <div className="font-black text-sm uppercase tracking-wide text-center leading-tight" style={{ color: '#ffffff', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.06em' }}>
              {fixture.away_team}
            </div>
          </div>

        </div>
      </div>

      {/* Goal scorers (live / completed) */}
      {liveData && liveData.scorers.length > 0 && (
        <ScorersList scorers={liveData.scorers} homeTeam={fixture.home_team} awayTeam={fixture.away_team} />
      )}

      {/* Prediction zone */}
      {!isAdmin && (
        <div className="px-4 pb-4 relative" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', zIndex: 1 }}>
          <div className="pt-3">
            {pw.is_open && !isLive ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Stepper row */}
                <div className="flex items-center justify-center gap-5 mb-3">
                  <GoalStepper value={homeVal ?? 0} onChange={(v) => setValue('home', v)} />
                  <span className="font-black text-lg" style={{ color: 'rgba(255,255,255,0.15)', lineHeight: 1 }}>–</span>
                  <GoalStepper value={awayVal ?? 0} onChange={(v) => setValue('away', v)} />
                </div>

                {/* Result preview pill + penalty section */}
                {isDrawPrediction ? (
                  <div className="mb-3 space-y-3">
                    {fixture.penalty_enabled ? (
                      <>
                        {/* Penalty shootout label */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(245,184,0,0.7)' }}>⚽ Penalty Shootout</span>
                          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                        </div>
                        {/* Penalty steppers */}
                        <div className="flex items-center justify-center gap-5">
                          <GoalStepper value={penHomeVal ?? 0} onChange={(v) => setValue('pen_home', v)} />
                          <span className="font-black text-lg" style={{ color: 'rgba(255,255,255,0.15)', lineHeight: 1 }}>–</span>
                          <GoalStepper value={penAwayVal ?? 0} onChange={(v) => setValue('pen_away', v)} />
                        </div>
                        {/* Penalty result pill */}
                        {isPenDrawInvalid ? (
                          <div className="text-center">
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                              ⚠ Penalties can't be a draw
                            </span>
                          </div>
                        ) : (() => {
                          const penWinner = (penHomeVal ?? 0) > (penAwayVal ?? 0) ? fixture.home_team : fixture.away_team;
                          return (
                            <div className="text-center">
                              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                                style={{ background: 'rgba(22,163,74,0.12)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.3)' }}>
                                {penWinner} wins on pens
                              </span>
                            </div>
                          );
                        })()}
                      </>
                    ) : (
                      <div className="text-center">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                          ⚠ No draws in knockout rounds
                        </span>
                      </div>
                    )}
                  </div>
                ) : (() => {
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
                    disabled={submitMutation.isPending || isPenDrawInvalid || (isDrawPrediction && !fixture.penalty_enabled)}
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

      {/* Inline stream embed */}
      {showStream && fixture.stream_url && (
        <div style={{ borderTop: '1px solid rgba(239,68,68,0.2)', position: 'relative', zIndex: 1 }}>
          <div
            className="flex items-center justify-between px-3 py-1.5"
            style={{ background: 'rgba(239,68,68,0.08)' }}
          >
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest" style={{ color: '#f87171' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Live
            </span>
            <div className="flex items-center gap-3">
              <a href={fixture.stream_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/25 hover:text-white/50 underline">↗ new tab</a>
              <button onClick={() => setShowStream(false)} className="text-[10px] text-white/25 hover:text-white/50">✕</button>
            </div>
          </div>
          <iframe
            src={fixture.stream_url}
            title="Live Stream"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; camera; microphone; clipboard-write"
            allowFullScreen
            // no sandbox — mobile needs allow-popups for player init
            style={{ display: 'block', width: '100%', height: '60vh', minHeight: '320px', border: 'none', background: '#000' }}
          />
        </div>
      )}
    </div>
  );
}

