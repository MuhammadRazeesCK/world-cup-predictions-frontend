import React from 'react';
import { BracketFixture, BracketData } from '../api/stats';

/* WC 2026 actual match numbers from DB */
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
    'United States': 'USA', 'Bosnia and Herzegovina': 'Bosnia',
    'Bosnia-Herzegovina': 'Bosnia', 'DR Congo': 'DR Congo', 'Congo DR': 'DR Congo',
    'Cape Verde Islands': 'Cape Verde', 'Saudi Arabia': 'S. Arabia',
    'South Africa': 'S. Africa', 'South Korea': 'S. Korea',
};
const sh = (t: string) => SHORTS[t] || t;

function Card({ n, data, w = 118 }: { n: number; data: BracketData; w?: number }) {
    const f = get(data, n);
    const done = f?.status === 'completed';
    const live = f?.status === 'live';
    const pens = done && f!.penalty_home_score != null;
    const homeWon = done && f!.home_score != null && (pens ? f!.penalty_home_score! > f!.penalty_away_score! : f!.home_score! > f!.away_score!);
    const awayWon = done && !homeWon;
    return (
        <div style={{ width: w, borderRadius: 8, border: `1px solid ${live ? 'rgba(34,197,94,0.5)' : done ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`, background: live ? 'rgba(34,197,94,0.05)' : done ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 6px', background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>M{n}</span>
                {live && <span style={{ fontSize: 8, color: '#4ade80', fontWeight: 900 }}>● LIVE</span>}
                {done && <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>FT</span>}
            </div>
            {/* Home */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', background: homeWon ? 'rgba(245,184,0,0.08)' : 'transparent', minHeight: 22 }}>
                <span style={{ fontSize: 10, fontWeight: homeWon ? 800 : 500, color: homeWon ? '#f5b800' : f ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.15)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: w - 32 }}>
                    {f ? sh(f.home_team) : '—'}
                </span>
                {f?.home_score != null && <span style={{ fontSize: 12, fontWeight: 900, color: homeWon ? '#f5b800' : 'rgba(255,255,255,0.45)', fontFamily: '"Bebas Neue", sans-serif', flexShrink: 0, marginLeft: 4 }}>{f.home_score}{pens ? `(${f.penalty_home_score})` : ''}</span>}
            </div>
            {/* Away */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', background: awayWon ? 'rgba(245,184,0,0.08)' : 'transparent', minHeight: 22, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 10, fontWeight: awayWon ? 800 : 500, color: awayWon ? '#f5b800' : f ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.15)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: w - 32 }}>
                    {f ? sh(f.away_team) : '—'}
                </span>
                {f?.away_score != null && <span style={{ fontSize: 12, fontWeight: 900, color: awayWon ? '#f5b800' : 'rgba(255,255,255,0.45)', fontFamily: '"Bebas Neue", sans-serif', flexShrink: 0, marginLeft: 4 }}>{f.away_score}{pens ? `(${f.penalty_away_score})` : ''}</span>}
            </div>
        </div>
    );
}

function ColHeader({ label }: { label: string }) {
    return <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,184,0,0.55)', textAlign: 'center', marginBottom: 8 }}>{label}</div>;
}

export function FullBracket({ data }: { data: BracketData }) {
    const CH = 58; // card height (header + 2 rows)
    const G = 8;   // gap between two R32 in a pair
    const BP = 28; // gap between pairs in same QF group
    const BG = 40; // gap between QF groups
    const COL = 14;

    // Heights
    const pairH = CH * 2 + G;           // height of one R32 pair
    const groupH = pairH * 2 + BP;      // height of a QF group (2 pairs)
    const totalH = groupH * 2 + BG;     // total bracket height per side

    const R32 = (arms: typeof LEFT_BRACKET) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {arms.map((arm, i) => (
                <React.Fragment key={arm.r16}>
                    {i === 2 && <div style={{ height: BG }} />}
                    {i === 1 && <div style={{ height: BP }} />}
                    {i === 3 && <div style={{ height: BP }} />}
                    <Card n={arm.r32[0]} data={data} />
                    <div style={{ height: G }} />
                    <Card n={arm.r32[1]} data={data} />
                </React.Fragment>
            ))}
        </div>
    );

    const R16 = (arms: typeof LEFT_BRACKET) => {
        const off = (pairH - CH) / 2;
        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: off }} />
                {arms.map((arm, i) => (
                    <React.Fragment key={arm.r16}>
                        {i === 1 && <div style={{ height: BP + pairH - CH }} />}
                        {i === 2 && <div style={{ height: BG + pairH - CH }} />}
                        {i === 3 && <div style={{ height: BP + pairH - CH }} />}
                        <Card n={arm.r16} data={data} />
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const QF = (arms: typeof LEFT_BRACKET) => {
        const qfOff = (groupH - CH) / 2;
        const qfNums = [...new Set(arms.map(a => a.qf))];
        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: qfOff }} />
                {qfNums.map((n, i) => (
                    <React.Fragment key={n}>
                        {i > 0 && <div style={{ height: BG + groupH - CH }} />}
                        <Card n={n} data={data} />
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const sfOff = (totalH - CH) / 2;

    const SF = (n: number) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: sfOff }} />
            <Card n={n} data={data} w={128} />
        </div>
    );

    return (
        <div style={{ overflowX: 'auto', paddingBottom: 16, paddingTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: COL, padding: '0 8px', minWidth: 'max-content' }}>

                <div><ColHeader label="R32" />{R32(LEFT_BRACKET)}</div>
                <div><ColHeader label="R16" />{R16(LEFT_BRACKET)}</div>
                <div><ColHeader label="QF" />{QF(LEFT_BRACKET)}</div>
                <div><ColHeader label="SF" />{SF(101)}</div>

                {/* CENTER */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f5b800', textShadow: '0 0 12px rgba(245,184,0,0.4)', textAlign: 'center' }}>🏆 Final</div>
                    <div style={{ marginTop: sfOff - 28 }}><Card n={104} data={data} w={144} /></div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 16, textAlign: 'center' }}>3rd Place</div>
                    <Card n={103} data={data} w={144} />
                </div>

                <div><ColHeader label="SF" />{SF(102)}</div>
                <div><ColHeader label="QF" />{QF(RIGHT_BRACKET)}</div>
                <div><ColHeader label="R16" />{R16(RIGHT_BRACKET)}</div>
                <div><ColHeader label="R32" />{R32(RIGHT_BRACKET)}</div>
            </div>
        </div>
    );
}
