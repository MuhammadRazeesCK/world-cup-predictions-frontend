import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';

const STAGE_LABELS: Record<string, string> = {
    round32: 'Round of 32',
    round16: 'Round of 16',
    qf:      'Quarter-Finals',
    sf:      'Semi-Finals',
    third_place: '3rd Place Play-off',
    final:   'Final 🏆',
};

const STAGE_ORDER = ['round32', 'round16', 'qf', 'sf', 'third_place', 'final'];

function ScoreBadge({ home, away, penHome, penAway, winner, homeTeam, awayTeam }: {
    home: number; away: number;
    penHome: number | null; penAway: number | null;
    winner: string | null; homeTeam: string; awayTeam: string;
}) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className={`font-semibold ${winner === homeTeam ? 'text-green-400' : 'text-text-secondary'}`}>{homeTeam}</span>
            <span className="bg-surface border border-slate-700 rounded px-2 py-0.5 font-mono font-bold text-text-primary">
                {home}–{away}
                {penHome !== null && penAway !== null && (
                    <span className="text-text-muted text-xs ml-1">(pen {penHome}–{penAway})</span>
                )}
            </span>
            <span className={`font-semibold ${winner === awayTeam ? 'text-green-400' : 'text-text-secondary'}`}>{awayTeam}</span>
        </div>
    );
}

function StatCard({ emoji, label, value, sub }: { emoji: string; label: string; value: string | number; sub?: string }) {
    return (
        <div className="bg-surface border border-slate-700 rounded-xl p-4 flex flex-col gap-1">
            <div className="text-2xl">{emoji}</div>
            <div className="text-text-muted text-xs uppercase tracking-wide">{label}</div>
            <div className="text-text-primary font-bold text-lg leading-tight">{value}</div>
            {sub && <div className="text-text-secondary text-xs">{sub}</div>}
        </div>
    );
}

function RecordCard({ emoji, label, username, value }: { emoji: string; label: string; username: string; value: string | number }) {
    return (
        <div className="bg-surface border border-slate-700 rounded-xl p-4 flex items-center gap-3">
            <div className="text-2xl">{emoji}</div>
            <div className="flex-1 min-w-0">
                <div className="text-text-muted text-xs uppercase tracking-wide">{label}</div>
                <div className="text-text-primary font-bold truncate">{username}</div>
            </div>
            <div className="text-accent font-bold text-lg shrink-0">{value}</div>
        </div>
    );
}

export function AdminWrapUp() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin', 'wrapup'],
        queryFn: () => adminApi.getWrapup(),
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) return <div className="text-text-secondary text-sm py-8 text-center">Loading wrap-up stats...</div>;
    if (error || !data) return <div className="text-red-400 text-sm py-8 text-center">Failed to load wrap-up data.</div>;

    const { summary, leaderboard, records, fixture_highlights, knockout_results } = data;

    // Group knockout results by stage
    const byStage: Record<string, typeof knockout_results> = {};
    for (const f of knockout_results) {
        if (!byStage[f.stage]) byStage[f.stage] = [];
        byStage[f.stage].push(f);
    }

    const champion = knockout_results.find((f: any) => f.stage === 'final')?.winner ?? null;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="text-center py-6 space-y-1">
                <div className="text-4xl">🏆</div>
                <h2 className="text-2xl font-bold text-text-primary">World Cup 2026 — Wrap Up</h2>
                <p className="text-text-secondary text-sm">The tournament is over. Here's how everyone did.</p>
                {champion && (
                    <div className="mt-3 inline-block bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2">
                        <span className="text-yellow-400 font-bold text-sm">🥇 World Champions: {champion}</span>
                    </div>
                )}
            </div>

            {/* Summary stats */}
            <section>
                <h3 className="text-text-muted text-xs uppercase tracking-widest mb-3">Tournament Overview</h3>
                <div className="grid grid-cols-2 gap-3">
                    <StatCard emoji="👥" label="Players" value={summary.total_players} />
                    <StatCard emoji="⚽" label="Matches Played" value={summary.completed_fixtures} sub={`of ${summary.total_fixtures} fixtures`} />
                    <StatCard emoji="🔮" label="Total Predictions" value={summary.total_predictions.toLocaleString()} />
                    <StatCard emoji="🎯" label="Exact Scores" value={summary.total_exact_scores.toLocaleString()} sub={`${((summary.total_exact_scores / summary.total_predictions) * 100).toFixed(1)}% of all predictions`} />
                    <StatCard emoji="⭐" label="Total Points Awarded" value={summary.total_points_awarded.toLocaleString()} />
                    <StatCard emoji="📊" label="Avg Predictions/Player" value={(summary.total_predictions / summary.total_players).toFixed(1)} sub={`out of ${summary.completed_fixtures} matches`} />
                </div>
            </section>

            {/* Records */}
            <section>
                <h3 className="text-text-muted text-xs uppercase tracking-widest mb-3">Individual Records</h3>
                <div className="space-y-2">
                    <RecordCard emoji="🔮" label="Most Predictions" username={records.most_predictions.username} value={`${records.most_predictions.value} predictions`} />
                    <RecordCard emoji="😴" label="Least Predictions" username={records.least_predictions.username} value={`${records.least_predictions.value} predictions`} />
                    <RecordCard emoji="🎯" label="Highest Accuracy" username={records.highest_accuracy.username} value={`${records.highest_accuracy.value}%`} />
                    <RecordCard emoji="🏅" label="Most Exact Scores" username={records.most_exact_scores.username} value={`${records.most_exact_scores.value} exact`} />
                    <RecordCard emoji="🔥" label="Longest Winning Streak" username={records.longest_success_streak.username} value={`${records.longest_success_streak.value} in a row`} />
                    <RecordCard emoji="💀" label="Longest Wrong Streak" username={records.longest_wrong_streak.username} value={`${records.longest_wrong_streak.value} in a row`} />
                </div>
            </section>

            {/* Match highlights */}
            {fixture_highlights.hardest_to_predict && (
                <section>
                    <h3 className="text-text-muted text-xs uppercase tracking-widest mb-3">Match Highlights</h3>
                    <div className="space-y-2">
                        <div className="bg-surface border border-slate-700 rounded-xl p-4">
                            <div className="text-xs text-text-muted uppercase tracking-wide mb-1">🧩 Hardest to Predict</div>
                            <div className="font-semibold text-text-primary text-sm">
                                {fixture_highlights.hardest_to_predict.home_team} {fixture_highlights.hardest_to_predict.home_score}–{fixture_highlights.hardest_to_predict.away_score} {fixture_highlights.hardest_to_predict.away_team}
                            </div>
                            <div className="text-text-secondary text-xs mt-1">
                                Only {fixture_highlights.hardest_to_predict.exact_count} of {fixture_highlights.hardest_to_predict.total_predictions} players got the exact score ({fixture_highlights.hardest_to_predict.exact_percentage}%)
                            </div>
                        </div>
                        <div className="bg-surface border border-slate-700 rounded-xl p-4">
                            <div className="text-xs text-text-muted uppercase tracking-wide mb-1">✅ Easiest to Predict</div>
                            <div className="font-semibold text-text-primary text-sm">
                                {fixture_highlights.easiest_to_predict.home_team} {fixture_highlights.easiest_to_predict.home_score}–{fixture_highlights.easiest_to_predict.away_score} {fixture_highlights.easiest_to_predict.away_team}
                            </div>
                            <div className="text-text-secondary text-xs mt-1">
                                {fixture_highlights.easiest_to_predict.exact_count} of {fixture_highlights.easiest_to_predict.total_predictions} players nailed the exact score ({fixture_highlights.easiest_to_predict.exact_percentage}%)
                            </div>
                        </div>
                        <div className="bg-surface border border-slate-700 rounded-xl p-4">
                            <div className="text-xs text-text-muted uppercase tracking-wide mb-1">🌍 Most Predicted Match</div>
                            <div className="font-semibold text-text-primary text-sm">
                                {fixture_highlights.most_predicted.home_team} vs {fixture_highlights.most_predicted.away_team}
                            </div>
                            <div className="text-text-secondary text-xs mt-1">
                                {fixture_highlights.most_predicted.total_predictions} predictions submitted
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Knockout bracket */}
            <section>
                <h3 className="text-text-muted text-xs uppercase tracking-widest mb-3">Knockout Stage Results</h3>
                <div className="space-y-4">
                    {STAGE_ORDER.filter((s) => byStage[s]?.length > 0).map((stage) => (
                        <div key={stage}>
                            <div className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-2">{STAGE_LABELS[stage]}</div>
                            <div className="space-y-2">
                                {byStage[stage].map((f: any) => (
                                    <div key={f.match_number} className="bg-surface border border-slate-700 rounded-xl p-3">
                                        <ScoreBadge
                                            home={f.home_score}
                                            away={f.away_score}
                                            penHome={f.penalty_home_score}
                                            penAway={f.penalty_away_score}
                                            winner={f.winner}
                                            homeTeam={f.home_team}
                                            awayTeam={f.away_team}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Full leaderboard */}
            <section>
                <h3 className="text-text-muted text-xs uppercase tracking-widest mb-3">Final Standings</h3>
                <div className="space-y-2">
                    {leaderboard.map((p: any) => (
                        <div key={p.user_id} className={`bg-surface border rounded-xl p-4 ${p.rank <= 3 ? 'border-yellow-500/40' : 'border-slate-700'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`text-lg font-bold w-8 text-center shrink-0 ${p.rank === 1 ? 'text-yellow-400' : p.rank === 2 ? 'text-slate-300' : p.rank === 3 ? 'text-amber-600' : 'text-text-muted'}`}>
                                    {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`}
                                </div>
                                {p.avatar_url ? (
                                    <img src={p.avatar_url} alt={p.username} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                                        {p.username[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-text-primary truncate">{p.username}</div>
                                    <div className="text-text-muted text-xs">
                                        {p.total_predictions} predictions · {p.accuracy_percentage}% accuracy
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-accent font-bold text-lg">{p.total_points} pts</div>
                                </div>
                            </div>
                            {/* Breakdown */}
                            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                                <div>
                                    <div className="text-text-primary font-semibold text-sm">{p.exact_predictions}</div>
                                    <div className="text-text-muted text-xs">Exact</div>
                                </div>
                                <div>
                                    <div className="text-text-primary font-semibold text-sm">{p.winner_predictions}</div>
                                    <div className="text-text-muted text-xs">Winner</div>
                                </div>
                                <div>
                                    <div className="text-green-400 font-semibold text-sm">{p.max_success_streak}</div>
                                    <div className="text-text-muted text-xs">Best streak</div>
                                </div>
                                <div>
                                    <div className="text-red-400 font-semibold text-sm">{p.max_wrong_streak}</div>
                                    <div className="text-text-muted text-xs">Worst streak</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
