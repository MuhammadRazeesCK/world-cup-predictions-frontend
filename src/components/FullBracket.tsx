import React, { useRef, useState, useEffect } from 'react';
import { BracketFixture, BracketData } from '../api/stats';

/* ─── WC 2026 bracket match numbers ────────────────────────────── */
// Left side: R32[arm][0,1] → R16[arm] → QF[group]
const L = [
    { r32: [33, 36], r16: 49, qf: 57 },
    { r32: [35, 38], r16: 50, qf: 57 },
    { r32: [43, 44], r16: 53, qf: 58 },
    { r32: [41, 42], r16: 54, qf: 58 },
];
// Right side (same structure)
const R = [
    { r32: [34, 37], r16: 51, qf: 59 },
    { r32: [39, 40], r16: 52, qf: 59 },
    { r32: [45, 48], r16: 56, qf: 60 },
    { r32: [47, 46], r16: 55, qf: 60 },
];

function get(data: BracketData, n: number): BracketFixture | null {
    for (const arr of Object.values(data)) {
        const m = (arr as BracketFixture[]).find(f => f.match_number === n);
        if (m) return m;
    }
    return null;
}

const SH: Record<string, string> = {
    'United States': 'USA', 'Bosnia and Herzegovina': 'Bosnia', 'Bosnia-Herzegovina': 'Bosnia',
    'Congo DR': 'DR Congo', 'Cape Verde Islands': 'Cape Verde', 'Saudi Arabia': 'S. Arabia',
    'South Africa': 'S. Africa', 'South Korea': 'S. Korea',
};
const FL: Record<string, string> = {
    'France': '🇫🇷', 'Morocco': '🇲🇦', 'Norway': '🇳🇴', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Argentina': '🇦🇷', 'Switzerland': '🇨🇭', 'Spain': '🇪🇸', 'Belgium': '🇧🇪',
    'Brazil': '🇧🇷', 'Mexico': '🇲🇽', 'Portugal': '🇵🇹', 'Netherlands': '🇳🇱',
    'Germany': '🇩🇪', 'USA': '🇺🇸', 'United States': '🇺🇸', 'Canada': '🇨🇦',
    'Japan': '🇯🇵', 'Croatia': '🇭🇷', 'South Africa': '🇿🇦', 'Australia': '🇦🇺',
    'Paraguay': '🇵🇾', 'Sweden': '🇸🇪', 'Ivory Coast': '🇨🇮', 'Ecuador': '🇪🇨',
    'DR Congo': '🇨🇩', 'Congo DR': '🇨🇩', 'Senegal': '🇸🇳', 'Egypt': '🇪🇬',
    'Bosnia and Herzegovina': '🇧🇦', 'Bosnia-Herzegovina': '🇧🇦',
    'Algeria': '🇩🇿', 'Colombia': '🇨🇴', 'Ghana': '🇬🇭',
    'Cape Verde': '🇨🇻', 'Cape Verde Islands': '🇨🇻', 'Austria': '🇦🇹',
};
const sh = (t: string) => SH[t] || t;
const fl = (t: string) => FL[t] || '🏳️';

/* ─── layout constants ──────────────────────────────────────────── */
const SLOT = 82;    // vertical space per R32 slot (card + gap)
const CH   = 62;    // card height
const CGAP = 38;    // horizontal gap between stage columns (for connector lines)

// Card widths per stage
const W = { r32: 122, r16: 126, qf: 130, sf: 134, final: 152 };

// Y center of each R32 slot (0-indexed across 8 slots per side)
const r32cy = (i: number) => SLOT * i + CH / 2;

// R16 center = midpoint of its two R32 cards
const r16cy = (j: number) => (r32cy(j * 2) + r32cy(j * 2 + 1)) / 2;

// QF center = midpoint of its two R16 cards
const qfcy = (k: number) => (r16cy(k * 2) + r16cy(k * 2 + 1)) / 2;

// SF center = midpoint of both QF cards
const sfcy = (qfcy(0) + qfcy(1)) / 2;

// Total bracket height
const TOTAL_H = SLOT * 8 + (CH - SLOT); // = 8*82 + (62-82) = 656 - 20 = 636? No: last card top = SLOT*7, bottom = SLOT*7 + CH
// Actually: totalH = r32[7].bottom = SLOT * 7 + CH
const TOTAL_H_CALC = SLOT * 7 + CH;

const x = {
    r32L:  0,
    r16L:  W.r32 + CGAP,
    qfL:   W.r32 + CGAP + W.r16 + CGAP,
    sfL:   W.r32 + CGAP + W.r16 + CGAP + W.qf + CGAP,
    final: W.r32 + CGAP + W.r16 + CGAP + W.qf + CGAP + W.sf + CGAP,
    get sfR()    { return this.final + W.final + CGAP; },
    get qfR()    { return this.sfR + W.sf + CGAP; },
    get r16R()   { return this.qfR + W.qf + CGAP; },
    get r32R()   { return this.r16R + W.r16 + CGAP; },
};
const TOTAL_W = x.r32R + W.r32;

/* ─── winner propagation helpers ─────────────────────────────────── */
function getWinner(data: BracketData, n: number): string | null {
    const f = get(data, n);
    if (!f || f.status !== 'completed' || f.home_score === null) return null;
    const pens = f.penalty_home_score != null;
    return (pens ? f.penalty_home_score! > f.penalty_away_score! : f.home_score > f.away_score!)
        ? f.home_team : f.away_team;
}

// Returns winner name if match done, or "Team1 / Team2" if scheduled, or null
function projected(data: BracketData, n: number): string | null {
    const f = get(data, n);
    if (!f) return null;
    const w = getWinner(data, n);
    if (w) return w;
    // Scheduled — show both potential teams
    return `${sh(f.home_team)} / ${sh(f.away_team)}`;
}

/* ─── card component ─────────────────────────────────────────────── */
// projHome/projAway: shown when no real fixture exists for this slot
function Card({ n, data, w, projHome, projAway, style }: {
    n: number; data: BracketData; w: number;
    projHome?: string | null; projAway?: string | null;
    style?: React.CSSProperties;
}) {
    const f = get(data, n);
    const done = f?.status === 'completed';
    const live = f?.status === 'live';
    const pens = done && f!.penalty_home_score != null;
    const homeWon = done && f!.home_score != null && (pens ? f!.penalty_home_score! > f!.penalty_away_score! : f!.home_score! > f!.away_score!);
    const awayWon = done && !homeWon;
    const border = live ? 'rgba(34,197,94,0.6)' : done ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)';
    const bg = live ? 'rgba(34,197,94,0.07)' : done ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)';

    // Use projected team if no real fixture team available
    const homeTeam = f?.home_team ?? undefined;
    const awayTeam = f?.away_team ?? undefined;

    const teamRow = (team: string | undefined, score: number | null | undefined, penScore: number | null | undefined, won: boolean, projText?: string | null) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 6px', height: 24, background: won ? 'rgba(245,184,0,0.1)' : 'transparent' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: projText && !team ? 9 : 10, fontWeight: won ? 800 : projText && !team ? 400 : 500, fontStyle: projText && !team ? 'italic' : 'normal', color: won ? '#f5b800' : team ? 'rgba(255,255,255,0.85)' : projText ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: w - 12 }}>
                {team ? <><span style={{ fontSize: 12, lineHeight: 1 }}>{fl(team)}</span>{sh(team)}</> : projText ? <span>{projText}</span> : <span>—</span>}
            </span>
            {score != null && <span style={{ fontSize: 13, fontWeight: 900, color: won ? '#f5b800' : 'rgba(255,255,255,0.45)', fontFamily: '"Bebas Neue",sans-serif', flexShrink: 0 }}>{score}{pens ? `(${penScore})` : ''}</span>}
        </div>
    );

    return (
        <div style={{ position: 'absolute', width: w, height: CH, borderRadius: 8, border: `1px solid ${border}`, background: bg, overflow: 'hidden', ...style }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '2px 6px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)', height: 14 }}>
                {live && <span style={{ fontSize: 8, color: '#4ade80', fontWeight: 900 }}>● LIVE</span>}
                {done && <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>FT</span>}
                {!f && (projHome || projAway) && <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>upcoming</span>}
            </div>
            {teamRow(homeTeam, f?.home_score, f?.penalty_home_score, homeWon, !homeTeam ? projHome : null)}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
            {teamRow(awayTeam, f?.away_score, f?.penalty_away_score, awayWon, !awayTeam ? projAway : null)}
        </div>
    );
}

/* ─── SVG connector lines ────────────────────────────────────────── */
function Lines() {
    const LC = 'rgba(245,184,0,0.3)';
    const lines: React.SVGProps<SVGLineElement>[] = [];

    const line = (x1: number, y1: number, x2: number, y2: number) =>
        lines.push({ x1, y1, x2, y2, stroke: LC, strokeWidth: 1 });

    // Helper: draw the bracket connector for a pair of inputs → one output
    const connector = (inX: number, topY: number, botY: number, outX: number) => {
        const midX = (inX + outX) / 2;
        const midY = (topY + botY) / 2;
        line(inX,  topY, midX, topY);  // top horizontal arm
        line(inX,  botY, midX, botY);  // bottom horizontal arm
        line(midX, topY, midX, botY);  // vertical connector
        line(midX, midY, outX, midY);  // output arm to next stage
    };

    // LEFT SIDE connectors
    // R32 → R16 (4 pairs)
    for (let j = 0; j < 4; j++) {
        connector(x.r32L + W.r32, r32cy(j * 2), r32cy(j * 2 + 1), x.r16L);
    }
    // R16 → QF (2 pairs)
    for (let k = 0; k < 2; k++) {
        connector(x.r16L + W.r16, r16cy(k * 2), r16cy(k * 2 + 1), x.qfL);
    }
    // QF → SF
    connector(x.qfL + W.qf, qfcy(0), qfcy(1), x.sfL);
    // SF → Final
    line(x.sfL + W.sf, sfcy, x.final, sfcy);

    // RIGHT SIDE connectors (mirrored)
    for (let j = 0; j < 4; j++) {
        connector(x.sfR - (x.r32L + W.r32) + x.r32L, r32cy(j * 2), r32cy(j * 2 + 1), x.sfR);
    }
    // Actually just mirror:
    const rConnector = (inX: number, topY: number, botY: number, outX: number) => {
        const midX = (inX + outX) / 2;
        const midY = (topY + botY) / 2;
        line(inX,  topY, midX, topY);
        line(inX,  botY, midX, botY);
        line(midX, topY, midX, botY);
        line(midX, midY, outX, midY);
    };
    for (let j = 0; j < 4; j++) {
        rConnector(x.r32R, r32cy(j * 2), r32cy(j * 2 + 1), x.r32R + W.r32);
    }

    return null; // placeholder — will be done differently below
}

export function FullBracket({ data }: { data: BracketData }) {
    const [zoom, setZoom] = useState(0.52);
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastDist = useRef<number | null>(null);

    // On mount, scroll to show the Final (center of bracket)
    useEffect(() => {
        if (scrollRef.current) {
            const el = scrollRef.current;
            // Center of bracket in scaled coords
            const scaledCenter = (x.final + W.final / 2) * zoom;
            el.scrollLeft = scaledCenter - el.clientWidth / 2;
        }
    }, [zoom]);

    const onTS = (e: React.TouchEvent) => { if (e.touches.length === 2) lastDist.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); };
    const onTM = (e: React.TouchEvent) => { if (e.touches.length === 2 && lastDist.current !== null) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); setZoom(z => Math.min(1.6, Math.max(0.3, z + (d - lastDist.current!) / 220))); lastDist.current = d; } };
    const onTE = () => { lastDist.current = null; };

    const LC = 'rgba(245,184,0,0.28)';

    const conn = (inX: number, topY: number, botY: number, outX: number, key: string) => {
        const midX = (inX + outX) / 2;
        const midY = (topY + botY) / 2;
        return (
            <g key={key} stroke={LC} strokeWidth={1} fill="none">
                <line x1={inX}  y1={topY} x2={midX} y2={topY} />
                <line x1={inX}  y1={botY} x2={midX} y2={botY} />
                <line x1={midX} y1={topY} x2={midX} y2={botY} />
                <line x1={midX} y1={midY} x2={outX} y2={midY} />
            </g>
        );
    };

    const lineEl = (x1: number, y1: number, x2: number, y2: number, key: string) => (
        <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={LC} strokeWidth={1} />
    );

    const TH = TOTAL_H_CALC;
    const TW = TOTAL_W;

    // Dynamically find SF/Final/3rd by stage (don't hardcode match numbers)
    const allFixtures = Object.values(data).flat() as BracketFixture[];
    const byStage = (stage: string) => allFixtures.filter(f => f.stage === stage).sort((a, b) => a.match_number - b.match_number);
    const sfs = byStage('sf');
    const finals = byStage('final');
    const thirds = byStage('third_place');
    const sfLNum = sfs[0]?.match_number ?? 101;
    const sfRNum = sfs[1]?.match_number ?? 102;
    const finalNum = finals[0]?.match_number ?? 104;
    const thirdNum = thirds[0]?.match_number ?? 103;

    const svgLines = (
        <svg width={TW} height={TH} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            {/* LEFT: R32 → R16 */}
            {[0,1,2,3].map(j => conn(x.r32L + W.r32, r32cy(j*2), r32cy(j*2+1), x.r16L, `l32r16-${j}`))}
            {/* LEFT: R16 → QF */}
            {[0,1].map(k => conn(x.r16L + W.r16, r16cy(k*2), r16cy(k*2+1), x.qfL, `l16qf-${k}`))}
            {/* LEFT: QF → SF */}
            {conn(x.qfL + W.qf, qfcy(0), qfcy(1), x.sfL, 'lqfsf')}
            {/* LEFT: SF → Final */}
            {lineEl(x.sfL + W.sf, sfcy, x.final, sfcy, 'lsff')}
            {/* RIGHT: R32 → R16 (arms from R32 left edge, output to R16 right edge) */}
            {[0,1,2,3].map(j => conn(x.r32R, r32cy(j*2), r32cy(j*2+1), x.r16R + W.r16, `r32r16-${j}`))}
            {/* RIGHT: R16 → QF */}
            {[0,1].map(k => conn(x.r16R, r16cy(k*2), r16cy(k*2+1), x.qfR + W.qf, `r16qf-${k}`))}
            {/* RIGHT: QF → SF */}
            {conn(x.qfR, qfcy(0), qfcy(1), x.sfR + W.sf, 'rqfsf')}
            {/* RIGHT: SF → Final */}
            {lineEl(x.sfR, sfcy, x.final + W.final, sfcy, 'rsff')}
        </svg>
    );

    // Stage label
    const label = (lbl: string, xp: number, w: number) => (
        <div key={lbl+xp} style={{ position: 'absolute', top: -22, left: xp, width: w, textAlign: 'center', fontSize: 9, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,184,0,0.55)' }}>
            {lbl}
        </div>
    );

    return (
        <div ref={scrollRef} style={{ overflowX: 'auto', paddingBottom: 16, touchAction: 'pan-x pan-y' }}
            onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', textAlign: 'center', marginBottom: 10 }}>Pinch to zoom · scroll sideways</p>
            {/* Wrapper sized to scaled dimensions so scroll container works correctly */}
            <div style={{ width: TW * zoom, height: (TH + 60) * zoom, position: 'relative' }}>
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0, paddingTop: 28 }}>
                <div style={{ position: 'relative', width: TW, height: TH }}>
                    {svgLines}

                    {/* Stage labels */}
                    {label('R32', x.r32L, W.r32)}
                    {label('R16', x.r16L, W.r16)}
                    {label('QF', x.qfL, W.qf)}
                    {label('SF', x.sfL, W.sf)}
                    {label('🏆 Final', x.final, W.final)}
                    {label('SF', x.sfR, W.sf)}
                    {label('QF', x.qfR, W.qf)}
                    {label('R16', x.r16R, W.r16)}
                    {label('R32', x.r32R, W.r32)}

                    {/* LEFT R32 cards */}
                    {L.flatMap((arm, ai) => arm.r32.map((mn, ri) => (
                        <Card key={`lr32-${mn}`} n={mn} data={data} w={W.r32}
                            style={{ left: x.r32L, top: r32cy(ai * 2 + ri) - CH / 2 }} />
                    )))}

                    {/* LEFT R16 cards */}
                    {L.map((arm, j) => (
                        <Card key={`lr16-${arm.r16}`} n={arm.r16} data={data} w={W.r16}
                            style={{ left: x.r16L, top: r16cy(j) - CH / 2 }} />
                    ))}

                    {/* LEFT QF cards */}
                    {[57, 58].map((mn, k) => (
                        <Card key={`lqf-${mn}`} n={mn} data={data} w={W.qf}
                            style={{ left: x.qfL, top: qfcy(k) - CH / 2 }} />
                    ))}

                    {/* LEFT SF */}
                    <Card n={sfLNum} data={data} w={W.sf}
                        projHome={projected(data, 57)}
                        projAway={projected(data, 58)}
                        style={{ left: x.sfL, top: sfcy - CH / 2 }} />

                    {/* FINAL */}
                    <Card n={finalNum} data={data} w={W.final}
                        projHome={projected(data, sfLNum)}
                        projAway={projected(data, sfRNum)}
                        style={{ left: x.final, top: sfcy - CH / 2 }} />

                    {/* 3RD PLACE label + card */}
                    <div style={{ position: 'absolute', left: x.final, top: sfcy + CH / 2 + 18, width: W.final, textAlign: 'center', fontSize: 8, color: 'rgba(255,255,255,0.28)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        3rd Place
                    </div>
                    <Card n={thirdNum} data={data} w={W.final} style={{ left: x.final, top: sfcy + CH / 2 + 34 }} />

                    {/* RIGHT SF */}
                    <Card n={sfRNum} data={data} w={W.sf}
                        projHome={projected(data, 59)}
                        projAway={projected(data, 60)}
                        style={{ left: x.sfR, top: sfcy - CH / 2 }} />

                    {/* RIGHT QF cards */}
                    {[59, 60].map((mn, k) => (
                        <Card key={`rqf-${mn}`} n={mn} data={data} w={W.qf}
                            style={{ left: x.qfR, top: qfcy(k) - CH / 2 }} />
                    ))}

                    {/* RIGHT R16 cards */}
                    {R.map((arm, j) => (
                        <Card key={`rr16-${arm.r16}`} n={arm.r16} data={data} w={W.r16}
                            style={{ left: x.r16R, top: r16cy(j) - CH / 2 }} />
                    ))}

                    {/* RIGHT R32 cards */}
                    {R.flatMap((arm, ai) => arm.r32.map((mn, ri) => (
                        <Card key={`rr32-${mn}`} n={mn} data={data} w={W.r32}
                            style={{ left: x.r32R, top: r32cy(ai * 2 + ri) - CH / 2 }} />
                    )))}
                </div>
                </div>
            </div>
        </div>
    );
}
