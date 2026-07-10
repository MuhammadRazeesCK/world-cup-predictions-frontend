import { BracketFixture, BracketData } from '../api/stats';

/* ─── WC 2026 bracket topology ───────────────────────────────────
   Each entry = { slot, r32a, r32b, r16, qf, sf, side }
   side: 'L' = left half, 'R' = right half
   Pairs of r32 → r16 → qf → sf on each side
   ────────────────────────────────────────────────────────────── */

// Each "arm" of the bracket: two R32 matches → one R16 → feeds QF
const BRACKET_ARMS = [
    // LEFT SIDE — top to bottom
    { r32: [74, 77], r16: 89, qf: 97, sf: 101, side: 'L' as const, arm: 0 },
    { r32: [73, 75], r16: 90, qf: 97, sf: 101, side: 'L' as const, arm: 1 },
    { r32: [79, 80], r16: 92, qf: 98, sf: 101, side: 'L' as const, arm: 2 },
    { r32: [83, 84], r16: 93, qf: 98, sf: 101, side: 'L' as const, arm: 3 },
    // RIGHT SIDE — top to bottom
    { r32: [76, 78], r16: 91, qf: 99, sf: 102, side: 'R' as const, arm: 0 },
    { r32: [85, 86], r16: 95, qf: 99, sf: 102, side: 'R' as const, arm: 1 },
    { r32: [81, 82], r16: 94, qf: 100, sf: 102, side: 'R' as const, arm: 2 },
    { r32: [87, 88], r16: 96, qf: 100, sf: 102, side: 'R' as const, arm: 3 },
];

function getMatch(data: BracketData, matchNumber: number): BracketFixture | null {
    for (const matches of Object.values(data)) {
        const m = (matches as BracketFixture[]).find((f: BracketFixture) => f.match_number === matchNumber);
        if (m) return m;
    }
    return null;
}

function teamName(team: string) {
    // Shorten long names
    const SHORT: Record<string, string> = {
        'United States': 'USA',
        'Bosnia-Herzegovina': 'Bosnia',
        'Congo DR': 'DR Congo',
        'Cape Verde Islands': 'Cape Verde',
        'Saudi Arabia': 'S. Arabia',
        'South Africa': 'S. Africa',
        'South Korea': 'S. Korea',
        'New Zealand': 'NZ',
        'Bosnia and Herzegovina': 'Bosnia',
    };
    return SHORT[team] || team;
}

interface MatchSlotProps {
    fixture: BracketFixture | null;
    matchNumber: number;
    compact?: boolean;
}

function MatchSlot({ fixture: f, matchNumber, compact }: MatchSlotProps) {
    const isDone = f?.status === 'completed';
    const isLive = f?.status === 'live';
    const hasPens = isDone && f!.penalty_home_score != null;

    const homeWon = isDone && f!.home_score != null && (hasPens
        ? f!.penalty_home_score! > f!.penalty_away_score!
        : f!.home_score! > f!.away_score!);
    const awayWon = isDone && !homeWon;

    const w = compact ? 108 : 130;
    const h = compact ? 52 : 60;

    if (!f) {
        return (
            <div style={{
                width: w, height: h, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    M{matchNumber}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', marginTop: 2 }}>TBD</div>
            </div>
        );
    }

    return (
        <div style={{
            width: w, height: h, borderRadius: 8,
            border: isLive ? '1px solid rgba(22,163,74,0.5)' : '1px solid rgba(255,255,255,0.1)',
            background: isDone ? 'rgba(255,255,255,0.04)' : isLive ? 'rgba(22,163,74,0.06)' : 'rgba(255,255,255,0.03)',
            overflow: 'hidden',
            flexShrink: 0,
        }}>
            {/* Match label */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '2px 6px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(0,0,0,0.2)',
            }}>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: '0.08em' }}>
                    M{f.match_number}
                </span>
                {isLive && <span style={{ fontSize: 7, color: '#4ade80', fontWeight: 900 }}>● LIVE</span>}
                {isDone && <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>FT</span>}
            </div>

            {/* Home */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '3px 6px',
                background: homeWon ? 'rgba(245,184,0,0.06)' : 'transparent',
            }}>
                <span style={{
                    fontSize: compact ? 9 : 10, fontWeight: homeWon ? 800 : 500,
                    color: homeWon ? '#f5b800' : 'rgba(255,255,255,0.8)',
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: w - 32,
                }}>
                    {teamName(f.home_team)}
                </span>
                {f.home_score != null && (
                    <span style={{
                        fontSize: 11, fontWeight: 900, color: homeWon ? '#f5b800' : 'rgba(255,255,255,0.5)',
                        fontFamily: '"Bebas Neue", sans-serif', flexShrink: 0,
                    }}>
                        {f.home_score}{hasPens ? `(${f.penalty_home_score})` : ''}
                    </span>
                )}
            </div>

            {/* Away */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '3px 6px',
                background: awayWon ? 'rgba(245,184,0,0.06)' : 'transparent',
            }}>
                <span style={{
                    fontSize: compact ? 9 : 10, fontWeight: awayWon ? 800 : 500,
                    color: awayWon ? '#f5b800' : 'rgba(255,255,255,0.8)',
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: w - 32,
                }}>
                    {teamName(f.away_team)}
                </span>
                {f.away_score != null && (
                    <span style={{
                        fontSize: 11, fontWeight: 900, color: awayWon ? '#f5b800' : 'rgba(255,255,255,0.5)',
                        fontFamily: '"Bebas Neue", sans-serif', flexShrink: 0,
                    }}>
                        {f.away_score}{hasPens ? `(${f.penalty_away_score})` : ''}
                    </span>
                )}
            </div>
        </div>
    );
}

// A column of evenly-spaced slots
function BracketColumn({ title, slots, gap }: { title: string; slots: React.ReactNode[]; gap: number }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
                fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(245,184,0,0.6)', marginBottom: 10, textAlign: 'center',
            }}>
                {title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap }}>
                {slots}
            </div>
        </div>
    );
}

export function FullBracket({ data }: { data: BracketData }) {
    const get = (n: number) => getMatch(data, n);

    // Finals / SF / 3rd
    const final = get(104);
    const sf1 = get(101);
    const sf2 = get(102);
    const thirdPlace = get(103);

    // Left bracket arms (top 4)
    const leftArms = BRACKET_ARMS.filter(a => a.side === 'L');
    const rightArms = BRACKET_ARMS.filter(a => a.side === 'R');

    const COL_GAP = 16;
    const SLOT_H = 60;
    const COMPACT_H = 52;

    // Vertical spacing: R32 → needs 8 slots each gap 8px, R16 → 4, QF → 2, SF → 1
    const R32_GAP = 8;
    const R16_GAP = SLOT_H + R32_GAP * 2 + R32_GAP; // centers between two R32 + gaps
    const QF_GAP = (SLOT_H + R16_GAP) * 2 - SLOT_H;
    const SF_GAP = (SLOT_H + QF_GAP) * 2 - SLOT_H;

    return (
        <div style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: 16 }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: COL_GAP,
                padding: '0 8px', minWidth: 'max-content',
            }}>

                {/* ── LEFT: R32 ─────────── */}
                <BracketColumn
                    title="R32"
                    gap={R32_GAP}
                    slots={leftArms.flatMap(arm =>
                        arm.r32.map(mn => (
                            <div key={mn} style={{ marginBottom: arm.arm < leftArms.length - 1 && arm.r32[1] === mn ? R16_GAP - SLOT_H - R32_GAP : 0 }}>
                                <MatchSlot fixture={get(mn)} matchNumber={mn} compact />
                            </div>
                        ))
                    )}
                />

                {/* ── LEFT: R16 ─────────── */}
                <BracketColumn
                    title="R16"
                    gap={R16_GAP}
                    slots={leftArms.map(arm => (
                        <div key={arm.r16} style={{ marginBottom: arm.arm < leftArms.length - 1 ? QF_GAP / 2 - SLOT_H : 0 }}>
                            <MatchSlot fixture={get(arm.r16)} matchNumber={arm.r16} />
                        </div>
                    ))}
                />

                {/* ── LEFT: QF ──────────── */}
                <BracketColumn
                    title="QF"
                    gap={QF_GAP}
                    slots={[...new Set(leftArms.map(a => a.qf))].map(mn => (
                        <MatchSlot key={mn} fixture={get(mn)} matchNumber={mn} />
                    ))}
                />

                {/* ── LEFT: SF ──────────── */}
                <BracketColumn
                    title="SF"
                    gap={0}
                    slots={[<MatchSlot key={101} fixture={sf1} matchNumber={101} />]}
                />

                {/* ── CENTER: Final + 3rd ── */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    <div style={{
                        fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
                        color: '#f5b800', textAlign: 'center', marginBottom: 4,
                        textShadow: '0 0 16px rgba(245,184,0,0.5)',
                    }}>
                        🏆 Final
                    </div>
                    <MatchSlot fixture={final} matchNumber={104} />
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 8 }}>
                        3rd Place
                    </div>
                    <MatchSlot fixture={thirdPlace} matchNumber={103} />
                </div>

                {/* ── RIGHT: SF ─────────── */}
                <BracketColumn
                    title="SF"
                    gap={0}
                    slots={[<MatchSlot key={102} fixture={sf2} matchNumber={102} />]}
                />

                {/* ── RIGHT: QF ─────────── */}
                <BracketColumn
                    title="QF"
                    gap={QF_GAP}
                    slots={[...new Set(rightArms.map(a => a.qf))].map(mn => (
                        <MatchSlot key={mn} fixture={get(mn)} matchNumber={mn} />
                    ))}
                />

                {/* ── RIGHT: R16 ─────────── */}
                <BracketColumn
                    title="R16"
                    gap={R16_GAP}
                    slots={rightArms.map(arm => (
                        <div key={arm.r16} style={{ marginBottom: arm.arm < rightArms.length - 1 ? QF_GAP / 2 - SLOT_H : 0 }}>
                            <MatchSlot fixture={get(arm.r16)} matchNumber={arm.r16} />
                        </div>
                    ))}
                />

                {/* ── RIGHT: R32 ─────────── */}
                <BracketColumn
                    title="R32"
                    gap={R32_GAP}
                    slots={rightArms.flatMap(arm =>
                        arm.r32.map(mn => (
                            <div key={mn} style={{ marginBottom: arm.arm < rightArms.length - 1 && arm.r32[1] === mn ? R16_GAP - SLOT_H - R32_GAP : 0 }}>
                                <MatchSlot fixture={get(mn)} matchNumber={mn} compact />
                            </div>
                        ))
                    )}
                />
            </div>
        </div>
    );
}
