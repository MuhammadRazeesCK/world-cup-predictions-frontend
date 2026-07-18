import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { statsApi, PlayerLeader, StatCategory, Group, BracketFixture, BracketData } from '../api/stats';
import { DateTime } from 'luxon';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { FullBracket } from '../components/FullBracket';

function formatKickoff(iso: string) {
    return DateTime.fromISO(iso).setZone('Asia/Kolkata').toFormat('d MMM, h:mm a');
}

/* ─── helpers ─────────────────────────────────────────────────── */
function Skeleton() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                {[130, 160, 130].map((h, i) => (
                    <div key={i} className="rounded-2xl animate-pulse" style={{ height: h, background: 'rgba(255,255,255,0.05)' }} />
                ))}
            </div>
            {[1,2,3,4,5,6,7].map(i => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
        </div>
    );
}

/* ─── player image ────────────────────────────────────────────── */
function PlayerImg({ player, className, style }: { player: PlayerLeader; className?: string; style?: React.CSSProperties }) {
    const [failed, setFailed] = useState(false);
    if (player.headshotUrl && !failed) {
        return <img src={player.headshotUrl} alt={player.name} className={className} style={style} onError={() => setFailed(true)} />;
    }
    if (player.flagUrl) {
        return (
            <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20%', ...style }}>
                <img src={player.flagUrl} alt={player.country} style={{ width: '100%', height: 'auto', borderRadius: 3 }} />
            </div>
        );
    }
    return (
        <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'rgba(255,255,255,0.2)', ...style }}>
            {player.name.charAt(0)}
        </div>
    );
}

/* ─── podium card (top 3) ─────────────────────────────────────── */
const MEDAL = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['#f5b800', '#c0c0c0', '#cd7f32'];
const MEDAL_GLOW = ['rgba(245,184,0,0.35)', 'rgba(192,192,192,0.25)', 'rgba(205,127,50,0.25)'];

function PodiumCard({ player, statLabel, order }: { player: PlayerLeader; statLabel: string; order: 0|1|2 }) {
    const color = MEDAL_COLORS[order];
    const glow = MEDAL_GLOW[order];
    const height = order === 0 ? 172 : 148;

    return (
        <div
            className="relative rounded-2xl overflow-hidden flex flex-col"
            style={{
                height,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${color}35`,
                boxShadow: `0 4px 20px ${glow}`,
                order: order === 1 ? -1 : order === 0 ? 0 : 1,
            }}
        >
            {/* Photo fills card */}
            <PlayerImg
                player={player}
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: 'cover', objectPosition: 'top' }}
            />
            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)' }} />
            {/* Stat badge top-right */}
            <div className="absolute top-2 right-2 text-right">
                <div
                    className="font-black tabular-nums leading-none"
                    style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.8rem', color, textShadow: `0 0 12px ${glow}` }}
                >
                    {player.value}
                </div>
                <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{statLabel}</div>
            </div>
            {/* Medal top-left */}
            <div className="absolute top-2 left-2 text-lg">{MEDAL[order]}</div>
            {/* Name bottom */}
            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5">
                <p className="font-black text-white text-xs leading-tight truncate" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                    {player.name}
                </p>
                <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.5)', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                    {player.country}
                </p>
            </div>
        </div>
    );
}

/* ─── compact row (rank 4+) ───────────────────────────────────── */
function CompactRow({ player, max, statLabel }: { player: PlayerLeader; max: number; statLabel: string }) {
    const [failed, setFailed] = useState(false);
    const pct = max > 0 ? Math.round((player.value / max) * 100) : 0;

    return (
        <div className="flex items-center gap-3 py-2.5 px-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {/* Rank */}
            <span className="text-xs font-black w-5 text-center flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {player.rank}
            </span>

            {/* Tiny avatar */}
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                {player.headshotUrl && !failed ? (
                    <img src={player.headshotUrl} alt="" className="w-full h-full object-cover object-top" onError={() => setFailed(true)} />
                ) : player.flagUrl ? (
                    <div className="w-full h-full flex items-center justify-center p-1">
                        <img src={player.flagUrl} alt="" className="w-full h-auto rounded-sm" />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-white/20">{player.name.charAt(0)}</div>
                )}
            </div>

            {/* Name + bar */}
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{player.name}</span>
                    <span className="text-xs font-black flex-shrink-0" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: '"Bebas Neue", sans-serif' }}>
                        {player.value} <span className="text-[9px] font-normal" style={{ color: 'rgba(255,255,255,0.25)' }}>{statLabel}</span>
                    </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'rgba(255,255,255,0.25)' }} />
                </div>
            </div>
        </div>
    );
}

/* ─── full category view ──────────────────────────────────────── */
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

    const top3 = cat.leaders.slice(0, 3);
    const rest = cat.leaders.slice(3);

    // Podium order: 2nd (left), 1st (center, tallest), 3rd (right)
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

    return (
        <div className="space-y-4">
            {/* Podium */}
            {top3.length > 0 && (
                <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {podiumOrder.map((p, i) => {
                        const realOrder = p.rank === 1 ? 0 : p.rank === 2 ? 1 : 2;
                        return (
                            <PodiumCard key={p.name} player={p} statLabel={statLabel} order={realOrder as 0|1|2} />
                        );
                    })}
                </div>
            )}

            {/* Rest */}
            {rest.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="px-3">
                        {rest.map((p) => (
                            <CompactRow key={p.name} player={p} max={max} statLabel={statLabel} />
                        ))}
                    </div>
                </div>
            )}
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
    // Most advanced stage first — Final on top when it exists, then 3rd place, SF, QF, R16, R32
    const STAGE_ORDER = ['final', 'third_place', 'sf', 'qf', 'round16', 'round32'];
    const stages = STAGE_ORDER.filter((s) => (data[s] ?? []).length > 0);

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
    { key: 'bracket', label: '🏟 Knockout', catName: null },
    { key: 'scorers', label: '⚽ Scorers', catName: 'goals' },
    { key: 'assists', label: '🎯 Assists', catName: 'assists' },
    { key: 'shots', label: '🔥 Shots', catName: 'shotsOnTarget' },
    { key: 'saves', label: '🧤 Saves', catName: 'saves' },
    { key: 'discipline', label: '🟨 Cards', catName: 'yellowCards' },
    { key: 'groups', label: '🏆 Groups', catName: null },
];

export default function StatsPage() {
    const [activeTab, setActiveTab] = useState('bracket');
    const [flushing, setFlushing] = useState(false);
    const { isAdmin } = useAuth();
    const queryClient = useQueryClient();

    const flushCache = async () => {
        setFlushing(true);
        try {
            await apiClient.post('/stats/flush');
            queryClient.invalidateQueries({ queryKey: ['tournament-stats'] });
        } finally {
            setFlushing(false);
        }
    };

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
                            {isAdmin && (
                                <button
                                    onClick={flushCache}
                                    disabled={flushing}
                                    className="ml-3 font-bold underline"
                                    style={{ color: flushing ? 'rgba(245,184,0,0.3)' : 'rgba(245,184,0,0.6)' }}
                                >
                                    {flushing ? 'Refreshing…' : '↺ Refresh from ESPN'}
                                </button>
                            )}
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

                {/* Bracket tab — full visual bracket */}
                {activeTab === 'bracket' && (
                    bracketLoading
                        ? <Skeleton />
                        : <FullBracket data={bracketData ?? {}} />
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
