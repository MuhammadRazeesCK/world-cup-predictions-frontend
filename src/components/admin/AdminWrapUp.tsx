import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toPng } from 'html-to-image';
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

const D = {
    bg: '#080b14', surface: 'rgba(255,255,255,0.035)', border: 'rgba(255,255,255,0.07)',
    gold: '#f5c518', cyan: '#00c8ff', green: '#00e676', red: '#ff5252',
    text: '#f0f4ff', textDim: '#b8c8e0', textMuted: '#4a6280',
    rank1: '#f5c518', rank2: '#d4d4d8', rank3: '#fb923c',
    dots: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23ffffff' fill-opacity='0.045'/%3E%3C/svg%3E")`,
};
const PALETTES: [string, string][] = [
    ['#6366f1','#818cf8'],['#8b5cf6','#a78bfa'],['#ec4899','#f472b6'],
    ['#14b8a6','#2dd4bf'],['#f59e0b','#fbbf24'],['#10b981','#34d399'],
    ['#3b82f6','#60a5fa'],['#ef4444','#f87171'],['#a855f7','#c084fc'],
    ['#06b6d4','#22d3ee'],['#84cc16','#a3e635'],['#f97316','#fb923c'],
];
function palColor(name: string): [string, string] {
    const h = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return PALETTES[h % PALETTES.length];
}
function ExportAvatar({ name, size = 28 }: { name: string; size?: number }) {
    const [from, to] = palColor(name);
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${from}, ${to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: size * 0.42, color: '#fff', flexShrink: 0, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}
function rankColor(rank: number) {
    return rank === 1 ? D.rank1 : rank === 2 ? D.rank2 : rank === 3 ? D.rank3 : D.textMuted;
}
function rankLabel(rank: number) {
    return rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
}

function WrapUpExportCard({ cardRef, data }: { cardRef: React.RefObject<HTMLDivElement | null>; data: any }) {
    const { summary, leaderboard, records } = data;
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div ref={cardRef as React.RefObject<HTMLDivElement>} style={{ width: 900, background: D.bg, color: D.text, overflow: 'hidden', fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            {/* Top stripe */}
            <div style={{ height: 4, background: `linear-gradient(90deg, ${D.gold}, ${D.cyan})` }} />

            {/* Header */}
            <div style={{ padding: '24px 40px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${D.border}`, backgroundImage: D.dots }}>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.22em', color: D.gold, textTransform: 'uppercase' }}>⚽ WC 2026 Predictions League</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: D.text, marginTop: 4, letterSpacing: '-0.01em' }}>Final Wrap Up 🏆</div>
                    <div style={{ fontSize: 11, color: D.textMuted, marginTop: 3 }}>Tournament complete · {today}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 38, fontWeight: 900, color: D.gold }}>{summary.total_players}</div>
                    <div style={{ fontSize: 10, color: D.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Players</div>
                </div>
            </div>

            {/* Summary stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: `1px solid ${D.border}` }}>
                {[
                    { label: 'Predictions', value: summary.total_predictions.toLocaleString() },
                    { label: 'Exact Scores', value: summary.total_exact_scores.toLocaleString() },
                    { label: 'Points Awarded', value: summary.total_points_awarded.toLocaleString() },
                    { label: 'Matches Played', value: `${summary.completed_fixtures}` },
                ].map((s, i) => (
                    <div key={i} style={{ padding: '16px 24px', borderRight: i < 3 ? `1px solid ${D.border}` : 'none', textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: D.cyan }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: D.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Records */}
            <div style={{ padding: '18px 40px', borderBottom: `1px solid ${D.border}`, background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.22em', color: D.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>Individual Records</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                        { emoji: '🔮', label: 'Most Predictions', username: records.most_predictions.username, value: `${records.most_predictions.value}` },
                        { emoji: '🎯', label: 'Highest Accuracy', username: records.highest_accuracy.username, value: `${records.highest_accuracy.value}%` },
                        { emoji: '🏅', label: 'Most Exact Scores', username: records.most_exact_scores.username, value: `${records.most_exact_scores.value} exact` },
                        { emoji: '😴', label: 'Least Predictions', username: records.least_predictions.username, value: `${records.least_predictions.value}` },
                        { emoji: '🔥', label: 'Longest Win Streak', username: records.longest_success_streak.username, value: `${records.longest_success_streak.value} in a row` },
                        { emoji: '💀', label: 'Longest Wrong Streak', username: records.longest_wrong_streak.username, value: `${records.longest_wrong_streak.value} in a row` },
                    ].map((r, i) => (
                        <div key={i} style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontSize: 20 }}>{r.emoji}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 9, color: D.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{r.label}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: D.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.username}</div>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: D.gold, flexShrink: 0 }}>{r.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Leaderboard header */}
            <div style={{ padding: '14px 40px 8px', display: 'grid', gridTemplateColumns: '44px 32px 1fr 64px 56px 56px 72px 72px', gap: 0, alignItems: 'center' }}>
                {['', '', 'Player', 'Points', 'Exact', 'Winner', 'Accuracy', 'Streak'].map((h, i) => (
                    <div key={i} style={{ fontSize: 9, fontWeight: 800, color: D.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: i >= 3 ? 'center' : 'left' }}>{h}</div>
                ))}
            </div>
            <div style={{ height: 1, background: D.border, marginInline: 40 }} />

            {/* Leaderboard rows */}
            <div style={{ padding: '0 40px 8px' }}>
                {leaderboard.map((p: any, i: number) => (
                    <div key={p.user_id} style={{ display: 'grid', gridTemplateColumns: '44px 32px 1fr 64px 56px 56px 72px 72px', gap: 0, alignItems: 'center', padding: '8px 0', borderBottom: i < leaderboard.length - 1 ? `1px solid ${D.border}` : 'none' }}>
                        <div style={{ fontSize: p.rank <= 3 ? 16 : 11, fontWeight: 700, color: rankColor(p.rank), textAlign: 'left' }}>{rankLabel(p.rank)}</div>
                        <ExportAvatar name={p.username} size={26} />
                        <div style={{ fontSize: 13, fontWeight: 600, color: D.text, paddingLeft: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.username}</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: D.gold, textAlign: 'center' }}>{p.total_points}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: D.textDim, textAlign: 'center' }}>{p.exact_predictions}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: D.textDim, textAlign: 'center' }}>{p.winner_predictions}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: p.accuracy_percentage >= 70 ? D.green : D.textDim, textAlign: 'center' }}>{p.accuracy_percentage}%</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: D.green, textAlign: 'center' }}>{p.max_success_streak}</div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 40px', borderTop: `1px solid ${D.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: 9, color: D.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>WC 2026 Predictions League</div>
                <div style={{ fontSize: 9, color: D.textMuted, letterSpacing: '0.1em' }}>Streak = longest consecutive correct predictions</div>
            </div>
        </div>
    );
}

export function AdminWrapUp() {
    const exportRef = useRef<HTMLDivElement>(null);
    const [exporting, setExporting] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin', 'wrapup'],
        queryFn: () => adminApi.getWrapup(),
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) return <div className="text-text-secondary text-sm py-8 text-center">Loading wrap-up stats...</div>;
    if (error || !data) return <div className="text-red-400 text-sm py-8 text-center">Failed to load wrap-up data.</div>;

    async function handleExport() {
        if (!exportRef.current) return;
        setExporting(true);
        try {
            const url = await toPng(exportRef.current, { pixelRatio: 2 });
            const a = document.createElement('a');
            a.download = 'wc2026-wrapup.png';
            a.href = url;
            a.click();
        } finally {
            setExporting(false);
        }
    }

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
            <div className="text-center py-6 space-y-1">                <div className="text-4xl">🏆</div>
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

            {/* Export button */}
            <div className="flex justify-center pt-2">
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="px-6 py-3 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-accent/80 transition-colors disabled:opacity-60"
                >
                    {exporting ? 'Generating...' : '📸 Export as Image'}
                </button>
            </div>

            {/* Hidden export card — rendered off-screen for toPng */}
            <div style={{ position: 'fixed', top: 0, left: '-9999px', zIndex: -1 }}>
                <WrapUpExportCard cardRef={exportRef} data={data} />
            </div>
        </div>
    );
}
