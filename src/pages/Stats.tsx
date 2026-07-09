import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { statsApi, PlayerLeader, StatCategory, Group, BracketFixture, BracketData } from '../api/stats';
import { DateTime } from 'luxon';

function formatKickoff(iso: string) {
    return DateTime.fromISO(iso).setZone('Asia/Kolkata').toFormat('d MMM, h:mm a');
}

/* ─── helpers ─────────────────────────────────────────────────── */
function Skeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
            ))}
        </div>
    );
}

/* ─── player row ──────────────────────────────────────────────── */
function PlayerRow({ player, max, statLabel }: { player: PlayerLeader; max: number; statLabel: string }) {
    const pct = max > 0 ? (player.value / max) * 100 : 0;
    const isFirst = player.rank === 1;

    return (
        <div
            className="relative flex items-center gap-3 rounded-xl px-4 py-3 overflow-hidden"
            style={{
                background: isFirst ? 'rgba(245,184,0,0.06)' : 'rgba(255,255,255,0.03)',
                border: isFirst ? '1px solid rgba(245,184,0,0.2)' : '1px solid rgba(255,255,255,0.06)',
            }}
        >
            {/* Bar fill */}
            <div
                className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700"
                style={{
                    width: `${pct}%`,
                    background: isFirst
                        ? 'rgba(245,184,0,0.07)'
                        : 'rgba(255,255,255,0.025)',
                }}
            />

            {/* Rank */}
            <span
                className="relative w-6 text-center text-xs font-black flex-shrink-0"
                style={{ color: isFirst ? '#f5b800' : 'rgba(255,255,255,0.25)' }}
            >
                {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
            </span>

            {/* Headshot or flag */}
            <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                {player.headshotUrl ? (
                    <img
                        src={player.headshotUrl}
                        alt={player.shortName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : player.flagUrl ? (
                    <img src={player.flagUrl} alt={player.country} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-bold">
                        {player.name.charAt(0)}
                    </div>
                )}
            </div>

            {/* Name + country */}
            <div className="relative flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: isFirst ? '#fff' : 'rgba(255,255,255,0.85)' }}>
                    {player.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    {player.flagUrl && !player.headshotUrl && null}
                    <p className="text-[11px] text-white/35 truncate">{player.country}</p>
                </div>
            </div>

            {/* Value */}
            <div className="relative text-right flex-shrink-0">
                <span
                    className="text-xl font-black tabular-nums"
                    style={{
                        fontFamily: '"Bebas Neue", sans-serif',
                        color: isFirst ? '#f5b800' : 'rgba(255,255,255,0.9)',
                    }}
                >
                    {player.displayValue.includes(',') ? player.displayValue.split(',')[1]?.trim() ?? player.displayValue : player.value}
                </span>
                <p className="text-[9px] text-white/25 uppercase tracking-wider">{statLabel}</p>
            </div>
        </div>
    );
}

/* ─── stat category panel ─────────────────────────────────────── */
function CategoryPanel({ cat }: { cat: StatCategory }) {
    const max = cat.leaders[0]?.value ?? 1;
    const statLabel = cat.name === 'goals' ? 'goals'
        : cat.name === 'assists' ? 'assists'
        : cat.name === 'shotsOnTarget' ? 'shots'
        : cat.name === 'yellowCards' ? 'yellows'
        : cat.name === 'redCards' ? 'reds'
        : cat.name === 'foulsCommitted' ? 'fouls'
        : cat.name === 'saves' ? 'saves'
        : 'value';

    return (
        <div className="space-y-2">
            {cat.leaders.map((p) => (
                <PlayerRow key={`${p.name}-${p.rank}`} player={p} max={max} statLabel={statLabel} />
            ))}
        </div>
    );
}

/* ─── group standings table ───────────────────────────────────── */
function GroupTable({ group }: { group: Group }) {
    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-xs font-black uppercase tracking-widest text-white/60">{group.name}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th className="text-left px-4 py-2 text-white/25 font-bold">Team</th>
                            <th className="text-center px-2 py-2 text-white/25 font-bold">P</th>
                            <th className="text-center px-2 py-2 text-white/25 font-bold">W</th>
                            <th className="text-center px-2 py-2 text-white/25 font-bold">D</th>
                            <th className="text-center px-2 py-2 text-white/25 font-bold">L</th>
                            <th className="text-center px-2 py-2 text-white/25 font-bold">GF</th>
                            <th className="text-center px-2 py-2 text-white/25 font-bold">GA</th>
                            <th className="text-center px-2 py-2 text-white/25 font-bold">GD</th>
                            <th className="text-center px-3 py-2 text-white/25 font-bold">Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {group.entries.map((e, i) => (
                            <tr
                                key={e.team}
                                style={{
                                    borderBottom: i < group.entries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                    background: e.advanced ? 'rgba(34,197,94,0.04)' : 'transparent',
                                }}
                            >
                                <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                        {e.flagUrl && (
                                            <img src={e.flagUrl} alt={e.team} className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0" />
                                        )}
                                        <span className="font-semibold" style={{ color: e.advanced ? '#4ade80' : 'rgba(255,255,255,0.8)' }}>
                                            {e.team}
                                        </span>
                                        {e.advanced && (
                                            <span className="text-[9px] font-black px-1 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>Q</span>
                                        )}
                                    </div>
                                </td>
                                <td className="text-center px-2 py-2.5 text-white/50">{e.played}</td>
                                <td className="text-center px-2 py-2.5 text-white/70">{e.wins}</td>
                                <td className="text-center px-2 py-2.5 text-white/50">{e.draws}</td>
                                <td className="text-center px-2 py-2.5 text-white/50">{e.losses}</td>
                                <td className="text-center px-2 py-2.5 text-white/60">{e.gf}</td>
                                <td className="text-center px-2 py-2.5 text-white/60">{e.ga}</td>
                                <td className="text-center px-2 py-2.5 text-white/50">{e.gd}</td>
                                <td className="text-center px-3 py-2.5 font-black text-sm" style={{ color: '#f5b800' }}>{e.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ─── bracket match card ──────────────────────────────────────── */
function BracketMatch({ f, label }: { f: BracketFixture | null; label: string }) {
    const isDone = f?.status === 'completed';
    const isLive = f?.status === 'live';
    const hasPens = isDone && f!.penalty_home_score != null;

    const homeWon = isDone && f!.home_score != null && f!.away_score != null && (
        hasPens ? f!.penalty_home_score! > f!.penalty_away_score! : f!.home_score > f!.away_score
    );
    const awayWon = isDone && !homeWon;

    return (
        <div
            className="rounded-xl overflow-hidden w-full"
            style={{
                background: isDone ? 'rgba(255,255,255,0.04)' : isLive ? 'rgba(22,163,74,0.06)' : 'rgba(255,255,255,0.02)',
                border: isLive ? '1px solid rgba(22,163,74,0.3)' : '1px solid rgba(255,255,255,0.07)',
            }}
        >
            {/* Label */}
            <div className="px-3 py-1 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/25">{label}</span>
                {f && (
                    <span className="text-[9px] text-white/20">
                        {isDone ? 'FT' : isLive ? '🔴 LIVE' : formatKickoff(f.kickoff_time)}
                    </span>
                )}
            </div>

            {/* Teams */}
            <div className="px-3 py-2 space-y-1">
                {f ? (
                    <>
                        {/* Home */}
                        <div className="flex items-center justify-between gap-2">
                            <span
                                className="text-xs font-bold truncate"
                                style={{ color: homeWon ? '#f5b800' : isDone ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)' }}
                            >
                                {homeWon && <span className="mr-1">🏆</span>}{f.home_team}
                            </span>
                            {f.home_score != null && (
                                <span className="text-sm font-black tabular-nums flex-shrink-0" style={{ fontFamily: '"Bebas Neue", sans-serif', color: homeWon ? '#f5b800' : 'rgba(255,255,255,0.5)' }}>
                                    {f.home_score}{hasPens ? ` (${f.penalty_home_score})` : ''}
                                </span>
                            )}
                        </div>
                        {/* Away */}
                        <div className="flex items-center justify-between gap-2">
                            <span
                                className="text-xs font-bold truncate"
                                style={{ color: awayWon ? '#f5b800' : isDone ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)' }}
                            >
                                {awayWon && <span className="mr-1">🏆</span>}{f.away_team}
                            </span>
                            {f.away_score != null && (
                                <span className="text-sm font-black tabular-nums flex-shrink-0" style={{ fontFamily: '"Bebas Neue", sans-serif', color: awayWon ? '#f5b800' : 'rgba(255,255,255,0.5)' }}>
                                    {f.away_score}{hasPens ? ` (${f.penalty_away_score})` : ''}
                                </span>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                        <div className="h-4 rounded animate-pulse w-3/4" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    </>
                )}
            </div>
        </div>
    );
}

const STAGE_LABELS: Record<string, string> = {
    round32: 'Round of 32',
    round16: 'Round of 16',
    qf: 'Quarter-Finals',
    sf: 'Semi-Finals',
    third_place: '3rd Place',
    final: 'Final',
};

function BracketView({ data }: { data: BracketData }) {
    const stages = ['round32', 'round16', 'qf', 'sf', 'third_place', 'final'].filter(
        (s) => (data[s] ?? []).length > 0
    );

    if (stages.length === 0) {
        return <div className="text-center py-12 text-white/25 text-sm">Knockout stage fixtures not added yet.</div>;
    }

    return (
        <div className="space-y-6">
            {stages.map((stage) => {
                const fixtures = data[stage] ?? [];
                return (
                    <div key={stage}>
                        {/* Stage header */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-0.5 h-4 rounded-full" style={{ background: '#f5b800' }} />
                            <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                {STAGE_LABELS[stage] ?? stage}
                            </h3>
                            <span className="text-[10px] text-white/25">{fixtures.length} match{fixtures.length !== 1 ? 'es' : ''}</span>
                        </div>

                        {/* Match grid */}
                        <div className={`grid gap-3 ${fixtures.length >= 4 ? 'grid-cols-2' : fixtures.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-2 sm:grid-cols-2'}`}>
                            {fixtures.map((f, i) => (
                                <BracketMatch
                                    key={f.id}
                                    f={f}
                                    label={`Match ${f.match_number}`}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ─── tab config ──────────────────────────────────────────────── */
const NAV_TABS = [
    { key: 'bracket', label: '🗂 Bracket', catName: null },
    { key: 'scorers', label: '⚽ Scorers', catName: 'goals' },
    { key: 'assists', label: '🎯 Assists', catName: 'assists' },
    { key: 'shots', label: '🔥 Shots', catName: 'shotsOnTarget' },
    { key: 'saves', label: '🧤 Saves', catName: 'saves' },
    { key: 'discipline', label: '🟨 Cards', catName: 'yellowCards' },
    { key: 'groups', label: '🏆 Groups', catName: null },
];

export default function StatsPage() {
    const [activeTab, setActiveTab] = useState('bracket');

    const { data, isLoading, error, dataUpdatedAt } = useQuery({
        queryKey: ['tournament-stats'],
        queryFn: statsApi.getTournament,
        staleTime: 4 * 60 * 1000,
        retry: 1,
    });

    const { data: bracketData, isLoading: bracketLoading } = useQuery({
        queryKey: ['bracket'],
        queryFn: statsApi.getBracket,
        staleTime: 60_000,
    });

    const activeTabCfg = NAV_TABS.find((t) => t.key === activeTab)!;
    const activeCategory = data?.categories.find((c) => c.name === activeTabCfg.catName);

    return (
        <div className="min-h-screen pb-20 sm:pb-8" style={{ background: '#0a0a0a' }}>
            <Header />
            <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">

                {/* Page title */}
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(245,184,0,0.6)' }}>
                        FIFA World Cup 2026
                    </div>
                    <h1
                        className="font-black text-white"
                        style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', letterSpacing: '0.06em' }}
                    >
                        Tournament Stats
                    </h1>
                    {dataUpdatedAt > 0 && (
                        <p className="text-[10px] text-white/20 mt-0.5">
                            Updated {new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                </div>

                {/* Tab bar */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {NAV_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            style={
                                activeTab === tab.key
                                    ? { background: '#f5b800', color: '#000' }
                                    : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }
                            }
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {isLoading && <Skeleton />}

                {error && (
                    <div className="text-center py-12 space-y-2">
                        <p className="text-2xl">📡</p>
                        <p className="text-white/40 text-sm">Couldn't load stats — ESPN API may be slow. Try again in a moment.</p>
                    </div>
                )}

                {/* Bracket tab — uses our own DB, independent of ESPN */}
                {activeTab === 'bracket' && (
                    bracketLoading
                        ? <Skeleton />
                        : <BracketView data={bracketData ?? {}} />
                )}

                {!isLoading && !error && activeTab !== 'groups' && activeTab !== 'bracket' && (
                    <>
                        {activeCategory ? (
                            <CategoryPanel cat={activeCategory} />
                        ) : (
                            <div className="text-center py-12 text-white/25 text-sm">No data for this category yet.</div>
                        )}
                    </>
                )}

                {!isLoading && !error && activeTab === 'groups' && (
                    <div className="space-y-4">
                        {(data?.groups ?? []).length === 0 && (
                            <div className="text-center py-12 text-white/25 text-sm">Group stage data not available.</div>
                        )}
                        {(data?.groups ?? []).map((g) => (
                            <GroupTable key={g.name} group={g} />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
