import React, { useRef, useState } from 'react';
import { BracketFixture, BracketData } from '../api/stats';

const LEFT_BRACKET = [
    { r32: [33, 36], r16: 49, qf: 57 },
    { r32: [35, 38], r16: 50, qf: 57 },
    { r32: [43, 44], r16: 53, qf: 58 },
    { r32: [41, 42], r16: 54, qf: 58 },
];
const RIGHT_BRACKET = [
    { r32: [34, 37], r16: 51, qf: 59 },
    { r32: [39, 40], r16: 52, qf: 59 },
    { r32: [45, 48], r16: 56, qf: 60 },
    { r32: [47, 46], r16: 55, qf: 60 },
];

function get(data: BracketData, n: number): BracketFixture | null {
    for (const matches of Object.values(data)) {
        const m = (matches as BracketFixture[]).find((f: BracketFixture) => f.match_number === n);
        if (m) return m;
    }
    return null;
}

const SHORTS: Record<string, string> = {
    'United States':'USA','Bosnia and Herzegovina':'Bosnia','Bosnia-Herzegovina':'Bosnia',
    'Congo DR':'DR Congo','Cape Verde Islands':'Cape Verde','Saudi Arabia':'S.Arabia',
    'South Africa':'S.Africa','South Korea':'S.Korea',
};
const FLAGS: Record<string, string> = {
    'France':'🇫🇷','Morocco':'🇲🇦','Norway':'🇳🇴','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Argentina':'🇦🇷',
    'Switzerland':'🇨🇭','Spain':'🇪🇸','Belgium':'🇧🇪','Brazil':'🇧🇷','Mexico':'🇲🇽',
    'Portugal':'🇵🇹','Netherlands':'🇳🇱','Germany':'🇩🇪','USA':'🇺🇸','United States':'🇺🇸',
    'Canada':'🇨🇦','Japan':'🇯🇵','Croatia':'🇭🇷','South Africa':'🇿🇦','Australia':'🇦🇺',
    'Paraguay':'🇵🇾','Sweden':'🇸🇪','Ivory Coast':'🇨🇮','Ecuador':'🇪🇨',
    'DR Congo':'🇨🇩','Congo DR':'🇨🇩','Senegal':'🇸🇳','Egypt':'🇪🇬',
    'Bosnia and Herzegovina':'🇧🇦','Bosnia-Herzegovina':'🇧🇦',
    'Algeria':'🇩🇿','Colombia':'🇨🇴','Ghana':'🇬🇭','Cape Verde':'🇨🇻',
    'Cape Verde Islands':'🇨🇻','Austria':'🇦🇹',
};
const sh = (t: string) => SHORTS[t] || t;
const fl = (t: string) => FLAGS[t] || '🏳️';

// Card height layout
const CH = 60; // total card height

function Card({ n, data, w = 120 }: { n: number; data: BracketData; w?: number }) {
    const f = get(data, n);
    const done = f?.status === 'completed';
    const live = f?.status === 'live';
    const pens = done && f!.penalty_home_score != null;
    const homeWon = done && f!.home_score != null && (pens ? f!.penalty_home_score! > f!.penalty_away_score! : f!.home_score! > f!.away_score!);
    const awayWon = done && !homeWon;
    const LINE = 'rgba(255,255,255,0.06)';
    return (
        <div style={{ width: w, height: CH, borderRadius: 8, border: `1px solid ${live ? 'rgba(34,197,94,0.5)' : done ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`, background: live ? 'rgba(34,197,94,0.06)' : done ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', overflow: 'hidden', flexShrink: 0 }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'2px 6px', background:'rgba(0,0,0,0.3)', borderBottom:`1px solid ${LINE}` }}>
                <span style={{ fontSize:8, color:'rgba(255,255,255,0.3)', fontWeight:700 }}>M{n}</span>
                {live && <span style={{ fontSize:8, color:'#4ade80', fontWeight:900 }}>● LIVE</span>}
                {done && <span style={{ fontSize:8, color:'rgba(255,255,255,0.2)', fontWeight:700 }}>FT</span>}
            </div>
            {/* Home */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 6px', background: homeWon ? 'rgba(245,184,0,0.09)' : 'transparent', height:25, borderBottom:`1px solid ${LINE}` }}>
                <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:10, fontWeight: homeWon ? 800 : 500, color: homeWon ? '#f5b800' : f ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', maxWidth: w-32 }}>
                    {f ? <><span style={{ fontSize:12 }}>{fl(f.home_team)}</span>{sh(f.home_team)}</> : <span style={{ color:'rgba(255,255,255,0.15)' }}>—</span>}
                </span>
                {f?.home_score != null && <span style={{ fontSize:13, fontWeight:900, color: homeWon ? '#f5b800' : 'rgba(255,255,255,0.4)', fontFamily:'"Bebas Neue",sans-serif', flexShrink:0 }}>{f.home_score}{pens ? `(${f.penalty_home_score})` : ''}</span>}
            </div>
            {/* Away */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 6px', background: awayWon ? 'rgba(245,184,0,0.09)' : 'transparent', height:25 }}>
                <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:10, fontWeight: awayWon ? 800 : 500, color: awayWon ? '#f5b800' : f ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', maxWidth: w-32 }}>
                    {f ? <><span style={{ fontSize:12 }}>{fl(f.away_team)}</span>{sh(f.away_team)}</> : <span style={{ color:'rgba(255,255,255,0.15)' }}>—</span>}
                </span>
                {f?.away_score != null && <span style={{ fontSize:13, fontWeight:900, color: awayWon ? '#f5b800' : 'rgba(255,255,255,0.4)', fontFamily:'"Bebas Neue",sans-serif', flexShrink:0 }}>{f.away_score}{pens ? `(${f.penalty_away_score})` : ''}</span>}
            </div>
        </div>
    );
}

// Connector: the ⌐¬ shape connecting two input cards to one output
// topH = space above center of top input card, botH = space below center of bottom input card
// totalH = distance from center of top card to center of bottom card
function Connector({ span, color = 'rgba(245,184,0,0.25)' }: { span: number; color?: string }) {
    // span = distance between center of top card and center of bottom card
    const half = span / 2;
    return (
        <div style={{ display:'flex', flexDirection:'column', flexShrink:0, width:12 }}>
            {/* top arm: right edge + bottom border */}
            <div style={{ height: half, borderRight:`1px solid ${color}`, borderBottom:`1px solid ${color}`, borderRadius:'0 0 3px 0' }} />
            {/* bottom arm: right edge + top border */}
            <div style={{ height: half, borderRight:`1px solid ${color}`, borderTop:`1px solid ${color}`, borderRadius:'0 3px 0 0' }} />
        </div>
    );
}

// A horizontal line stub coming out of a card (left or right side)
function Stub({ color = 'rgba(245,184,0,0.25)' }: { color?: string }) {
    return <div style={{ width: 10, height: 1, background: color, flexShrink: 0, alignSelf: 'center' }} />;
}

function ColLabel({ label }: { label: string }) {
    return <div style={{ fontSize:9, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(245,184,0,0.55)', textAlign:'center', marginBottom:8 }}>{label}</div>;
}

export function FullBracket({ data }: { data: BracketData }) {
    const G = 8;    // gap between R32 pairs
    const BP = 28;  // gap between arms in same QF group
    const BG = 44;  // gap between QF groups

    // Heights as measured from card CENTER to card CENTER
    const pairSpan = CH + G;           // center-to-center of R32 pair
    const armSpan = pairSpan * 2 + BP; // center-to-center of R16 pair (= 2 R32 pairs + between-pair gap)
    const qfSpan = armSpan * 2 + BG;   // center-to-center of QF pair
    const sfSpan = qfSpan * 2;          // approx center-to-center of SF (both QF groups)

    // Total bracket height
    const totalH = qfSpan * 2 + BG + CH;

    // Pinch-to-zoom
    const [zoom, setZoom] = useState(0.55);
    const lastDist = useRef<number | null>(null);
    const onTS = (e: React.TouchEvent) => { if (e.touches.length === 2) lastDist.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); };
    const onTM = (e: React.TouchEvent) => { if (e.touches.length === 2 && lastDist.current !== null) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); setZoom(z => Math.min(1.6, Math.max(0.3, z + (d - lastDist.current!) / 220))); lastDist.current = d; } };
    const onTE = () => { lastDist.current = null; };

    // Build one side's columns
    const renderSide = (arms: typeof LEFT_BRACKET, side: 'L' | 'R') => {
        const isLeft = side === 'L';

        // R32 column: 8 cards arranged in 4 pairs, 2 QF groups
        const r32Col = (
            <div style={{ display:'flex', flexDirection:'column' }}>
                {arms.map((arm, i) => (
                    <React.Fragment key={arm.r16}>
                        {i === 1 && <div style={{ height: BP }} />}
                        {i === 2 && <div style={{ height: BG }} />}
                        {i === 3 && <div style={{ height: BP }} />}
                        <Card n={arm.r32[0]} data={data} />
                        <div style={{ height: G }} />
                        <Card n={arm.r32[1]} data={data} />
                    </React.Fragment>
                ))}
            </div>
        );

        // R32→R16 connectors: one per arm
        const r32r16Con = (
            <div style={{ display:'flex', flexDirection:'column' }}>
                {arms.map((arm, i) => (
                    <React.Fragment key={arm.r16}>
                        {i === 1 && <div style={{ height: BP }} />}
                        {i === 2 && <div style={{ height: BG }} />}
                        {i === 3 && <div style={{ height: BP }} />}
                        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                            <div style={{ height: CH / 2 }} />
                            <Connector span={pairSpan} />
                            <div style={{ height: CH / 2 }} />
                        </div>
                    </React.Fragment>
                ))}
            </div>
        );

        // R16 column
        const r16Off = G + CH / 2; // offset so R16 card centers between the two R32 cards
        const r16Col = (
            <div style={{ display:'flex', flexDirection:'column' }}>
                <div style={{ height: r16Off }} />
                {arms.map((arm, i) => (
                    <React.Fragment key={arm.r16}>
                        {i === 1 && <div style={{ height: BP + pairSpan - CH } /* space between arms */ } />}
                        {i === 2 && <div style={{ height: BG + pairSpan - CH }} />}
                        {i === 3 && <div style={{ height: BP + pairSpan - CH }} />}
                        <Card n={arm.r16} data={data} />
                    </React.Fragment>
                ))}
            </div>
        );

        // R16→QF connectors: one per QF (each spans two R16 cards)
        const r16qfCon = (
            <div style={{ display:'flex', flexDirection:'column' }}>
                <div style={{ height: r16Off + CH / 2 }} />
                {[0, 2].map((gi, ci) => {
                    const span = armSpan + BP;
                    return (
                        <React.Fragment key={gi}>
                            {ci === 1 && <div style={{ height: BG + armSpan - CH }} />}
                            <Connector span={span} />
                        </React.Fragment>
                    );
                })}
            </div>
        );

        // QF column
        const qfOff = r16Off + CH / 2 + (armSpan + BP) / 2 - CH / 2;
        const qfNums = [...new Set(arms.map(a => a.qf))];
        const qfCol = (
            <div style={{ display:'flex', flexDirection:'column' }}>
                <div style={{ height: qfOff }} />
                {qfNums.map((n, i) => (
                    <React.Fragment key={n}>
                        {i > 0 && <div style={{ height: BG + (armSpan + BP) * 2 - CH }} />}
                        <Card n={n} data={data} />
                    </React.Fragment>
                ))}
            </div>
        );

        // QF→SF connector
        const sfOff = qfOff + CH / 2;
        const sfSpanLocal = BG + (armSpan + BP) * 2;
        const qfsfCon = (
            <div style={{ display:'flex', flexDirection:'column' }}>
                <div style={{ height: sfOff }} />
                <Connector span={sfSpanLocal} />
            </div>
        );

        // SF column
        const sfCardOff = sfOff + sfSpanLocal / 2 - CH / 2;
        const sfNum = isLeft ? 101 : 102;
        const sfCol = (
            <div style={{ display:'flex', flexDirection:'column' }}>
                <div style={{ height: sfCardOff }} />
                <Card n={sfNum} data={data} w={128} />
            </div>
        );

        // SF→Final stub
        const sfStub = (
            <div style={{ display:'flex', flexDirection:'column' }}>
                <div style={{ height: sfCardOff + CH / 2 - 0.5 }} />
                <Stub />
            </div>
        );

        if (isLeft) return [r32Col, r32r16Con, r16Col, r16qfCon, qfCol, qfsfCon, sfCol, sfStub];
        return [sfStub, sfCol, qfsfCon, qfCol, r16qfCon, r16Col, r32r16Con, r32Col];
    };

    const leftParts = renderSide(LEFT_BRACKET, 'L');
    const rightParts = renderSide(RIGHT_BRACKET, 'R');

    // Final: vertically centered (use sfCardOff of left side)
    const r16Off = G + CH / 2;
    const qfOff = r16Off + CH / 2 + ((CH + G) * 2 + BP) / 2;
    const sfSpanLocal = BG + ((CH + G) * 2 + BP) * 2;
    const sfCardOff = qfOff + sfSpanLocal / 2;
    const finalOff = sfCardOff - CH / 2;

    return (
        <div style={{ overflowX:'auto', paddingBottom:16, paddingTop:4, touchAction:'pan-x pan-y' }}
            onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}>
            <p style={{ fontSize:9, color:'rgba(255,255,255,0.18)', textAlign:'center', marginBottom:8 }}>Pinch to zoom · scroll sideways</p>
            <div style={{ transform:`scale(${zoom})`, transformOrigin:'top left', display:'inline-flex', alignItems:'flex-start', gap:0, padding:'0 16px' }}>
                {/* LEFT SIDE */}
                {leftParts.map((col, i) => <div key={`l${i}`}>{col}</div>)}

                {/* CENTER: Final + 3rd place */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                    <div style={{ fontSize:10, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:'#f5b800', textShadow:'0 0 14px rgba(245,184,0,0.5)', textAlign:'center', marginBottom:8 }}>🏆 Final</div>
                    <div style={{ height: finalOff - 20 }} />
                    <Card n={104} data={data} w={148} />
                    <div style={{ height:24 }} />
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.28)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', textAlign:'center', marginBottom:6 }}>3rd Place</div>
                    <Card n={103} data={data} w={148} />
                </div>

                {/* RIGHT SIDE */}
                {rightParts.map((col, i) => <div key={`r${i}`}>{col}</div>)}
            </div>
        </div>
    );
}
