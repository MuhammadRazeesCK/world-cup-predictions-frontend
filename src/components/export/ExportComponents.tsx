/**
 * Shared design tokens, helpers, and card components for image export.
 * Used by both AdminExportTab and UserExportPage.
 */
import { useRef, useState, useEffect } from 'react';
import React from 'react';
import { WC2026_TEAMS } from '../../utils/teams';
import type { LeaderboardEntry } from '../../types';

export const CARD_W = 900;
export const PREVIEW_SCALE = 0.67;

export function getFlag(n: string): string { return WC2026_TEAMS.find((t) => t.name === n)?.flag ?? '🏳️'; }
export function fmtDate(d: Date = new Date()): string { return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
export function stageName(s: string): string {
    const m: Record<string, string> = { group: 'Group Stage', round32: 'Round of 32', round16: 'Round of 16', qf: 'Quarter-Final', sf: 'Semi-Final', third_place: 'Third Place', final: 'Final' };
    return m[s] ?? s;
}

const PALETTES: [string, string][] = [
    ['#6366f1', '#818cf8'], ['#8b5cf6', '#a78bfa'], ['#ec4899', '#f472b6'],
    ['#14b8a6', '#2dd4bf'], ['#f59e0b', '#fbbf24'], ['#10b981', '#34d399'],
    ['#3b82f6', '#60a5fa'], ['#ef4444', '#f87171'], ['#a855f7', '#c084fc'],
    ['#06b6d4', '#22d3ee'], ['#84cc16', '#a3e635'], ['#f97316', '#fb923c'],
];
export function pal(name: string): [string, string] {
    const h = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return PALETTES[h % PALETTES.length];
}

export const D = {
    bg: '#080b14',
    surface: 'rgba(255,255,255,0.035)',
    border: 'rgba(255,255,255,0.07)',
    borderBright: 'rgba(255,255,255,0.14)',
    gold: '#f5c518', cyan: '#00c8ff',
    green: '#00e676', greenBg: 'rgba(0,230,118,0.08)', greenBorder: 'rgba(0,230,118,0.22)',
    blue: '#40c4ff', blueBg: 'rgba(64,196,255,0.08)', blueBorder: 'rgba(64,196,255,0.22)',
    red: '#ff5252', redBg: 'rgba(255,82,82,0.08)', redBorder: 'rgba(255,82,82,0.20)',
    text: '#f0f4ff', textDim: '#b8c8e0', textMuted: '#4a6280',
    rank1: '#f5c518', rank2: '#d4d4d8', rank3: '#fb923c',
    dots: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23ffffff' fill-opacity='0.045'/%3E%3C/svg%3E")`,
};

export const CARD_BASE: React.CSSProperties = {
    width: CARD_W, background: D.bg, color: D.text, overflow: 'hidden', position: 'relative',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
};
export const TOP_STRIPE: React.CSSProperties = { height: 4, background: `linear-gradient(90deg, ${D.gold}, ${D.cyan})` };
export const HDR: React.CSSProperties = {
    padding: '20px 40px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: `1px solid ${D.border}`, backgroundImage: D.dots,
};
export const FOOT: React.CSSProperties = {
    padding: '14px 40px', borderTop: `1px solid ${D.border}`,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(0,0,0,0.3)',
};

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
    const [from, to] = pal(name);
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: `linear-gradient(135deg, ${from}, ${to})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: size * 0.4, color: '#fff', flexShrink: 0,
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export function ScaledPreview({ scale, width, children }: { scale: number; width: number; children: React.ReactNode }) {
    const inner = useRef<HTMLDivElement>(null);
    const [h, setH] = useState(0);
    useEffect(() => {
        const el = inner.current; if (!el) return;
        const ro = new ResizeObserver(([e]) => setH(e.contentRect.height));
        ro.observe(el); return () => ro.disconnect();
    }, []);
    return (
        <div style={{ position: 'relative', width: width * scale, height: h > 0 ? h * scale : 350, margin: '0 auto', overflow: 'hidden', borderRadius: 6 }}>
            <div ref={inner} style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left', width }}>
                {children}
            </div>
        </div>
    );
}

export type FixtureExport = {
    id: string; match_number: number; home_team: string; away_team: string;
    kickoff_time: string; stage: string; status: string;
    home_score: number | null; away_score: number | null;
    penalty_home_score?: number | null; penalty_away_score?: number | null;
};
export type PredictionExport = {
    id: string; username: string; home_goals: number; away_goals: number;
    pen_home_goals: number | null; pen_away_goals: number | null;
    result: string | null; points: number | null; predicted_at: string;
};
export type FixtureGroup = { fixture: FixtureExport; predictions: PredictionExport[] };

export function MatchBanner({ fixture: f }: { fixture: FixtureExport }) {
    const hasScore = f.home_score !== null && f.away_score !== null;
    return (
        <div style={{ padding: '36px 40px 30px', position: 'relative', backgroundImage: D.dots, background: 'linear-gradient(180deg, rgba(245,197,24,0.05) 0%, transparent 100%)' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 240, height: 160, background: 'radial-gradient(ellipse, rgba(245,197,24,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 12, filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.6))' }}>{getFlag(f.home_team)}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: D.text }}>{f.home_team}</div>
                </div>
                <div style={{ minWidth: 220, textAlign: 'center' }}>
                    {hasScore ? (
                        <>
                            <div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em', color: D.gold, fontVariantNumeric: 'tabular-nums', textShadow: '0 0 40px rgba(245,197,24,0.3)' }}>
                                {f.home_score}<span style={{ color: D.textMuted, margin: '0 4px', fontSize: 64 }}>–</span>{f.away_score}
                            </div>
                            <div style={{ marginTop: 10, fontSize: 9, fontWeight: 800, letterSpacing: '0.25em', color: D.textMuted, textTransform: 'uppercase' }}>
                                {f.status === 'live' ? '🔴 Live' : 'Full Time'}
                            </div>
                        </>
                    ) : (
                        <div style={{ fontSize: 32, fontWeight: 900, color: D.textMuted, letterSpacing: '0.2em' }}>VS</div>
                    )}
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 12, filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.6))' }}>{getFlag(f.away_team)}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: D.text }}>{f.away_team}</div>
                </div>
            </div>
        </div>
    );
}

export const RC = {
    exact:        { label: '🎯 EXACT',    color: D.green,    bg: D.greenBg, border: D.greenBorder },
    winner:       { label: '✅ RESULT',   color: D.blue,     bg: D.blueBg,  border: D.blueBorder  },
    draw_correct: { label: '🕐 120′ +2', color: '#fb923c',  bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.22)' },
    wrong:        { label: '❌ MISSED',  color: D.red,      bg: D.redBg,   border: D.redBorder   },
};

export function PredictionsCard({ cardRef, group }: { cardRef: React.RefObject<HTMLDivElement>; group: FixtureGroup }) {
    const { fixture: f, predictions } = group;
    const ptColor = (pts: number | null) => pts === 8 ? D.gold : pts === 3 ? D.blue : D.textMuted;
    return (
        <div ref={cardRef} style={CARD_BASE}>
            <div style={TOP_STRIPE} />
            <div style={HDR}>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.22em', color: D.gold, textTransform: 'uppercase' }}>⚽ WC 2026 Predictions League</div>
                    <div style={{ fontSize: 9, color: D.textMuted, marginTop: 3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{stageName(f.stage)}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: D.textMuted, padding: '4px 14px', borderRadius: 20, background: D.surface, border: `1px solid ${D.border}` }}>MATCH {f.match_number}</div>
            </div>
            <MatchBanner fixture={f} />
            <div style={{ margin: '0 40px', height: 1, background: `linear-gradient(90deg, transparent, ${D.borderBright}, transparent)` }} />
            <div style={{ padding: '26px 40px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.22em', color: D.gold, textTransform: 'uppercase' }}>Predictions</span>
                    <span style={{ fontSize: 9, color: D.textMuted, letterSpacing: '0.06em' }}>
                        {predictions.length} participant{predictions.length !== 1 ? 's' : ''} &nbsp;·&nbsp; 🎯 = +8 pts &nbsp;·&nbsp; ✅ = +3 pts
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr 86px 136px 68px', padding: '9px 16px', gap: 8, fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: D.textMuted, background: 'rgba(255,255,255,0.03)', borderRadius: '8px 8px 0 0', border: `1px solid ${D.border}`, borderBottom: 'none' }}>
                    <div /><div>Player</div><div style={{ textAlign: 'center' }}>Pred</div><div style={{ textAlign: 'center' }}>Result</div><div style={{ textAlign: 'right' }}>Pts</div>
                </div>
                <div style={{ border: `1px solid ${D.border}`, borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                    {predictions.length === 0 ? (
                        <div style={{ padding: '24px 16px', textAlign: 'center', color: D.textMuted, fontSize: 13 }}>No predictions yet</div>
                    ) : predictions.map((p, i) => {
                        const rc = p.result ? RC[p.result as keyof typeof RC] : null;
                        return (
                            <div key={`${p.username}-${i}`} style={{ display: 'grid', gridTemplateColumns: '34px 1fr 86px 136px 68px', padding: '12px 16px', alignItems: 'center', gap: 8, background: i % 2 === 0 ? 'rgba(255,255,255,0.018)' : 'transparent', borderTop: i > 0 ? `1px solid ${D.border}` : 'none' }}>
                                <Avatar name={p.username} size={28} />
                                <div style={{ fontSize: 14, color: D.textDim, fontWeight: 600 }}>{p.username}</div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'ui-monospace,"SF Mono",monospace', color: D.text, letterSpacing: '-0.01em', lineHeight: 1 }}>{p.home_goals}–{p.away_goals}</div>
                                    {p.pen_home_goals != null && (
                                        <div style={{ fontSize: 9, fontWeight: 700, color: D.gold, marginTop: 3, letterSpacing: '0.06em', fontFamily: 'ui-monospace,"SF Mono",monospace' }}>pens {p.pen_home_goals}–{p.pen_away_goals}</div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    {rc ? (
                                        <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 11px', borderRadius: 20, color: rc.color, background: rc.bg, border: `1px solid ${rc.border}`, letterSpacing: '0.08em', whiteSpace: 'nowrap', display: 'inline-block' }}>{rc.label}</span>
                                    ) : (
                                        <span style={{ fontSize: 9, color: D.textMuted, letterSpacing: '0.1em', fontWeight: 600 }}>PENDING</span>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right', fontSize: p.points !== null && p.points > 0 ? 22 : 14, fontWeight: 900, fontFamily: 'ui-monospace,"SF Mono",monospace', color: ptColor(p.points) }}>
                                    {p.points !== null ? (p.points > 0 ? `+${p.points}` : '0') : '—'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div style={{ height: 16 }} />
            <div style={FOOT}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: D.textMuted, textTransform: 'uppercase' }}>⚽ WC 2026 Predictions League</span>
                <span style={{ fontSize: 10, color: D.textMuted }}>{fmtDate()}</span>
            </div>
        </div>
    );
}

export function StandingsCard({ cardRef, entries, scope = 'all' }: { cardRef: React.RefObject<HTMLDivElement>; entries: LeaderboardEntry[]; scope?: 'all' | 'group' | 'knockout' }) {
    const scopeLabel = scope === 'group' ? 'Group Stage' : scope === 'knockout' ? 'Knockouts' : 'Overall';
    const medals = ['🥇', '🥈', '🥉'];
    const maxPts = Math.max(...entries.map((e) => e.total_points), 1);
    const rc = (i: number) => i === 0 ? D.rank1 : i === 1 ? D.rank2 : i === 2 ? D.rank3 : D.textMuted;
    const podium = entries.length >= 3
        ? [{ e: entries[1], slot: 1 }, { e: entries[0], slot: 0 }, { e: entries[2], slot: 2 }]
        : [];
    const podH = [200, 140, 100];
    const avSize = [80, 58, 44];
    const nameSz = [16, 13, 11];
    const ptsSz = [34, 22, 18];
    const medalSz = [32, 24, 20];
    return (
        <div ref={cardRef} style={CARD_BASE}>
            <div style={TOP_STRIPE} />
            <div style={{ padding: '28px 40px 22px', backgroundImage: D.dots, background: 'linear-gradient(180deg, rgba(245,197,24,0.05) 0%, transparent 100%)', borderBottom: `1px solid ${D.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.22em', color: D.gold, textTransform: 'uppercase', marginBottom: 8 }}>⚽ WC 2026 Predictions League</div>
                <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: D.text }}>🏆 Standings</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: D.cyan, marginTop: 6, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{scopeLabel}</div>
                <div style={{ fontSize: 10, color: D.textMuted, marginTop: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{entries.length} Players · {fmtDate()}</div>
            </div>
            {podium.length > 0 && (
                <div style={{ padding: '40px 40px 0', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 8, borderBottom: `1px solid ${D.border}`, backgroundImage: D.dots, background: 'linear-gradient(180deg, rgba(245,197,24,0.03) 0%, transparent 60%)' }}>
                    {podium.map(({ e, slot }) => {
                        const ac = [D.rank2, D.rank1, D.rank3][slot];
                        const [from, to] = pal(e.username);
                        const av = avSize[slot];
                        const is1st = slot === 0;
                        return (
                            <div key={e.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: is1st ? 1.4 : 1 }}>
                                <div style={{ width: av, height: av, borderRadius: '50%', background: `linear-gradient(135deg,${from},${to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: av * 0.38, color: '#fff', border: `${is1st ? 4 : 3}px solid ${ac}`, boxShadow: is1st ? `0 0 0 4px ${ac}28, 0 0 36px ${ac}70` : `0 0 16px ${ac}50`, marginBottom: 10 }}>
                                    {e.username.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ fontSize: medalSz[slot], lineHeight: 1, marginBottom: 7 }}>{medals[slot]}</div>
                                <div style={{ fontSize: nameSz[slot], fontWeight: 700, color: ac, textAlign: 'center', marginBottom: 5, letterSpacing: '0.02em', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.username}</div>
                                <div style={{ fontSize: ptsSz[slot], fontWeight: 900, color: ac, fontFamily: 'ui-monospace,"SF Mono",monospace', letterSpacing: '-0.02em', marginBottom: 14, lineHeight: 1 }}>
                                    {e.total_points}<span style={{ fontSize: ptsSz[slot] * 0.38, fontWeight: 600, color: D.textMuted, marginLeft: 4 }}>pts</span>
                                </div>
                                <div style={{ width: '100%', height: podH[slot], background: `linear-gradient(180deg,${ac}${is1st ? '38' : '22'} 0%,${ac}06 100%)`, borderRadius: '10px 10px 0 0', border: `1px solid ${ac}${is1st ? '50' : '30'}`, borderBottom: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 12 }}>
                                    <span style={{ fontSize: is1st ? 16 : 12, fontWeight: 900, color: ac, opacity: is1st ? 0.7 : 0.4, letterSpacing: '0.1em' }}>#{slot + 1}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <div style={{ padding: '22px 40px 10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 72px 68px 50px 50px 50px 58px', padding: '9px 14px', gap: 6, fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: D.textMuted, background: 'rgba(255,255,255,0.03)', borderRadius: '8px 8px 0 0', border: `1px solid ${D.border}`, borderBottom: 'none' }}>
                    <div>Rank</div><div>Player</div><div style={{ textAlign: 'center' }}>Pts</div><div style={{ textAlign: 'center' }}>Played</div>
                    <div style={{ textAlign: 'center' }}>🎯</div><div style={{ textAlign: 'center' }}>✅</div><div style={{ textAlign: 'center' }}>❌</div><div style={{ textAlign: 'right' }}>Acc</div>
                </div>
                <div style={{ border: `1px solid ${D.border}`, borderRadius: '0 0 8px 8px', overflow: 'hidden', marginBottom: 14 }}>
                    {entries.map((e, i) => {
                        const wrong = Math.max(0, e.completed_predictions - e.exact_predictions - e.winner_predictions);
                        const barPct = Math.round((e.total_points / maxPts) * 100);
                        const color = rc(i); const top3 = i < 3;
                        return (
                            <div key={e.user_id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 72px 68px 50px 50px 50px 58px', padding: '11px 14px', alignItems: 'center', gap: 6, background: i === 0 ? 'rgba(245,197,24,0.04)' : i % 2 === 0 ? 'rgba(255,255,255,0.018)' : 'transparent', borderTop: i > 0 ? `1px solid ${D.border}` : 'none', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${barPct}%`, maxWidth: '100%', background: `linear-gradient(90deg,${color}10,transparent)`, pointerEvents: 'none' }} />
                                <div style={{ fontSize: top3 ? 20 : 12, color, fontWeight: 700, position: 'relative' }}>{top3 ? medals[i] : e.rank}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
                                    <Avatar name={e.username} size={26} />
                                    <span style={{ fontSize: 13, color: top3 ? color : D.textDim, fontWeight: top3 ? 700 : 500 }}>{e.username}</span>
                                </div>
                                <div style={{ textAlign: 'center', fontSize: 19, fontWeight: 900, color: top3 ? color : D.text, fontFamily: 'ui-monospace,"SF Mono",monospace', position: 'relative' }}>{e.total_points}</div>
                                <div style={{ textAlign: 'center', fontSize: 12, color: D.textMuted, position: 'relative' }}>{e.completed_predictions}</div>
                                <div style={{ textAlign: 'center', fontSize: 12, color: D.green, fontWeight: 700, position: 'relative' }}>{e.exact_predictions}</div>
                                <div style={{ textAlign: 'center', fontSize: 12, color: D.blue, fontWeight: 700, position: 'relative' }}>{e.winner_predictions}</div>
                                <div style={{ textAlign: 'center', fontSize: 12, color: D.red, fontWeight: 700, position: 'relative' }}>{wrong}</div>
                                <div style={{ textAlign: 'right', fontSize: 11, color: D.textMuted, position: 'relative' }}>{e.accuracy_percentage.toFixed(0)}%</div>
                            </div>
                        );
                    })}
                    {entries.length === 0 && <div style={{ padding: '24px 14px', textAlign: 'center', color: D.textMuted, fontSize: 13 }}>No data yet</div>}
                </div>
                <div style={{ display: 'flex', gap: 20, paddingBottom: 6 }}>
                    <span style={{ fontSize: 9, color: D.textMuted }}>🎯 Exact score (+8 pts)</span>
                    <span style={{ fontSize: 9, color: D.textMuted }}>✅ Correct result (+3 pts)</span>
                    <span style={{ fontSize: 9, color: D.textMuted }}>❌ Wrong (0 pts)</span>
                </div>
            </div>
            <div style={FOOT}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: D.textMuted, textTransform: 'uppercase' }}>⚽ WC 2026 Predictions League</span>
                <span style={{ fontSize: 10, color: D.textMuted }}>{fmtDate()}</span>
            </div>
        </div>
    );
}

export function WinnersCard({ cardRef, group }: { cardRef: React.RefObject<HTMLDivElement>; group: FixtureGroup }) {
    const { fixture: f, predictions } = group;
    const exact = predictions.filter((p) => p.result === 'exact');
    const winner = predictions.filter((p) => p.result === 'winner');
    const wrong = predictions.filter((p) => p.result === 'wrong');
    const Section = ({ emoji, title, pts, players, color, bg, border }: { emoji: string; title: string; pts: string; players: string[]; color: string; bg: string; border: string }) => (
        <div style={{ marginBottom: 16, padding: '18px 22px', borderRadius: 10, background: bg, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{emoji} {title}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color, opacity: 0.75, letterSpacing: '0.08em', background: `${color}18`, padding: '3px 12px', borderRadius: 12, border: `1px solid ${border}` }}>{pts}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {players.length === 0
                    ? <span style={{ fontSize: 12, color: D.textMuted, fontStyle: 'italic' }}>Nobody</span>
                    : players.map((name, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 28, background: `${color}12`, border: `1px solid ${border}` }}>
                            <Avatar name={name} size={24} />
                            <span style={{ fontSize: 13, fontWeight: 700, color }}>{name}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    );
    return (
        <div ref={cardRef} style={CARD_BASE}>
            <div style={TOP_STRIPE} />
            <div style={HDR}>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.22em', color: D.gold, textTransform: 'uppercase' }}>⚽ WC 2026 Predictions League</div>
                    <div style={{ fontSize: 9, color: D.textMuted, marginTop: 3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{stageName(f.stage)} · Match {f.match_number}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, padding: '5px 14px', borderRadius: 20, background: 'rgba(245,197,24,0.1)', color: D.gold, border: '1px solid rgba(245,197,24,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>🏆 Results</div>
            </div>
            <MatchBanner fixture={f} />
            <div style={{ margin: '0 40px', height: 1, background: `linear-gradient(90deg, transparent, ${D.borderBright}, transparent)` }} />
            <div style={{ padding: '26px 40px 12px' }}>
                <Section emoji="🎯" title="Exact Score" pts="+8 Points" players={exact.map((p) => p.username)} color={D.green} bg={D.greenBg} border={D.greenBorder} />
                <Section emoji="✅" title="Correct Result" pts="+3 Points" players={winner.map((p) => p.username)} color={D.blue} bg={D.blueBg} border={D.blueBorder} />
                <Section emoji="❌" title="Missed" pts="0 Points" players={wrong.map((p) => p.username)} color={D.red} bg={D.redBg} border={D.redBorder} />
            </div>
            <div style={FOOT}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: D.textMuted, textTransform: 'uppercase' }}>⚽ WC 2026 Predictions League</span>
                <span style={{ fontSize: 10, color: D.textMuted }}>{fmtDate()}</span>
            </div>
        </div>
    );
}

/** Predicted Winners card: shows who each user is backing before the match. */
export function PredictedWinnersCard({ cardRef, group }: { cardRef: React.RefObject<HTMLDivElement>; group: FixtureGroup }) {
    const { fixture: f, predictions } = group;

    // Group users by their predicted outcome
    const backing: { home: string[]; draw: string[]; away: string[] } = { home: [], draw: [], away: [] };
    for (const p of predictions) {
        if (p.home_goals > p.away_goals) backing.home.push(p.username);
        else if (p.away_goals > p.home_goals) backing.away.push(p.username);
        else backing.draw.push(p.username);
    }

    const Section = ({ emoji, label, players, color, bg, border }: { emoji: string; label: string; players: string[]; color: string; bg: string; border: string }) => (
        <div style={{ marginBottom: 16, padding: '18px 22px', borderRadius: 10, background: bg, border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{emoji} {label}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color, opacity: 0.7, padding: '3px 12px', borderRadius: 12, background: `${color}18`, border: `1px solid ${border}` }}>{players.length} player{players.length !== 1 ? 's' : ''}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {players.length === 0
                    ? <span style={{ fontSize: 12, color: D.textMuted, fontStyle: 'italic' }}>Nobody</span>
                    : players.map((name, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 28, background: `${color}12`, border: `1px solid ${border}` }}>
                            <Avatar name={name} size={24} />
                            <span style={{ fontSize: 13, fontWeight: 700, color }}>{name}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    );

    return (
        <div ref={cardRef} style={CARD_BASE}>
            <div style={TOP_STRIPE} />
            <div style={HDR}>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.22em', color: D.gold, textTransform: 'uppercase' }}>⚽ WC 2026 Predictions League</div>
                    <div style={{ fontSize: 9, color: D.textMuted, marginTop: 3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{stageName(f.stage)} · Match {f.match_number}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, padding: '5px 14px', borderRadius: 20, background: 'rgba(0,200,255,0.1)', color: D.cyan, border: '1px solid rgba(0,200,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>🔮 Pre-Match</div>
            </div>
            <MatchBanner fixture={f} />
            <div style={{ margin: '0 40px', height: 1, background: `linear-gradient(90deg, transparent, ${D.borderBright}, transparent)` }} />
            <div style={{ padding: '26px 40px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.22em', color: D.gold, textTransform: 'uppercase', marginBottom: 18 }}>Who's backing who?</div>
                <Section emoji={`${getFlag(f.home_team)}`} label={`${f.home_team} Win`} players={backing.home} color={D.green} bg={D.greenBg} border={D.greenBorder} />
                <Section emoji="🤝" label="Draw / Extra Time" players={backing.draw} color="#fbbf24" bg="rgba(251,191,36,0.08)" border="rgba(251,191,36,0.22)" />
                <Section emoji={`${getFlag(f.away_team)}`} label={`${f.away_team} Win`} players={backing.away} color={D.red} bg={D.redBg} border={D.redBorder} />
            </div>
            <div style={FOOT}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: D.textMuted, textTransform: 'uppercase' }}>⚽ WC 2026 Predictions League</span>
                <span style={{ fontSize: 10, color: D.textMuted }}>{fmtDate()}</span>
            </div>
        </div>
    );
}
