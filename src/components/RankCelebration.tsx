import { useEffect, useState } from 'react';

interface RankSnapshot {
    rank: number;
    points: number;
}

function getKey(userId: string) {
    return `knockout_rank_snapshot_${userId}`;
}

function loadSnapshot(userId: string): RankSnapshot | null {
    try {
        const raw = localStorage.getItem(getKey(userId));
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function saveSnapshot(userId: string, snap: RankSnapshot) {
    try { localStorage.setItem(getKey(userId), JSON.stringify(snap)); } catch {}
}

interface Props {
    userId: string;
    currentRank: number | null | undefined;
    currentPoints: number | undefined;
}

export function RankCelebration({ userId, currentRank, currentPoints }: Props) {
    const [celebration, setCelebration] = useState<null | {
        type: 'gold' | 'podium' | 'climb' | 'points';
        rank: number;
        delta: number;
        pointsDelta: number;
    }>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!currentRank || !currentPoints || !userId) return;

        const prev = loadSnapshot(userId);

        // First time — just save, no celebration
        if (!prev) {
            saveSnapshot(userId, { rank: currentRank, points: currentPoints });
            return;
        }

        const rankDelta = prev.rank - currentRank; // positive = improved
        const pointsDelta = currentPoints - prev.points;

        // Only celebrate if rank improved
        if (rankDelta <= 0 && pointsDelta <= 0) return;

        // Determine celebration type
        let type: 'gold' | 'podium' | 'climb' | 'points' = 'points';
        if (currentRank === 1) type = 'gold';
        else if (currentRank <= 3) type = 'podium';
        else if (rankDelta >= 3) type = 'climb';
        else if (pointsDelta > 0) type = 'points';

        setCelebration({ type, rank: currentRank, delta: rankDelta, pointsDelta });
        setVisible(true);

        // Save new snapshot immediately
        saveSnapshot(userId, { rank: currentRank, points: currentPoints });
    }, [userId, currentRank, currentPoints]);

    const dismiss = () => setVisible(false);

    if (!celebration || !visible) return null;

    const { type, rank, delta, pointsDelta } = celebration;

    /* ── Full-screen gold burst for #1 ─────────────────────────── */
    if (type === 'gold') {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
                onClick={dismiss}
            >
                <div
                    className="rounded-3xl px-8 py-10 text-center mx-4 max-w-sm w-full"
                    style={{ background: 'linear-gradient(135deg, rgba(245,184,0,0.15), rgba(255,140,0,0.08))', border: '1px solid rgba(245,184,0,0.4)', boxShadow: '0 0 60px rgba(245,184,0,0.2)' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="text-6xl mb-4 animate-bounce">👑</div>
                    <h1 className="font-black text-white mb-2" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.4rem', letterSpacing: '0.06em', color: '#f5b800' }}>
                        You're #1!
                    </h1>
                    <p className="text-white/60 text-sm mb-2">Leading the predictions league</p>
                    {pointsDelta > 0 && (
                        <p className="font-black text-2xl mb-6" style={{ color: '#f5b800', fontFamily: '"Bebas Neue", sans-serif' }}>
                            +{pointsDelta} pts this round
                        </p>
                    )}
                    <button
                        onClick={dismiss}
                        className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest"
                        style={{ background: 'linear-gradient(135deg, #f5b800, #ff8c00)', color: '#000' }}
                    >
                        Let's Go! 🔥
                    </button>
                </div>
            </div>
        );
    }

    /* ── Podium (top 3) ─────────────────────────────────────────── */
    if (type === 'podium') {
        const emoji = rank === 2 ? '🥈' : '🥉';
        const label = rank === 2 ? 'Silver Position!' : 'Bronze Position!';
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
                onClick={dismiss}
            >
                <div
                    className="rounded-3xl px-8 py-10 text-center mx-4 max-w-sm w-full"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="text-5xl mb-4">{emoji}</div>
                    <h1 className="font-black text-white mb-1" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', letterSpacing: '0.06em' }}>
                        #{rank} — {label}
                    </h1>
                    {delta > 0 && (
                        <p className="text-sm mb-1" style={{ color: '#4ade80' }}>↑ Climbed {delta} position{delta !== 1 ? 's' : ''}!</p>
                    )}
                    {pointsDelta > 0 && (
                        <p className="font-black text-xl mb-6" style={{ color: '#f5b800', fontFamily: '"Bebas Neue", sans-serif' }}>+{pointsDelta} pts</p>
                    )}
                    <button onClick={dismiss} className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
                        Nice! 💪
                    </button>
                </div>
            </div>
        );
    }

    /* ── Climb banner (3+ spots up) ─────────────────────────────── */
    if (type === 'climb') {
        return (
            <div
                className="fixed top-0 left-0 right-0 z-50 px-4 pt-safe"
                style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
            >
                <div
                    className="rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xl"
                    style={{ background: 'linear-gradient(135deg, #111 0%, rgba(34,197,94,0.12) 100%)', border: '1px solid rgba(34,197,94,0.3)', animation: 'slideDown 0.4s ease' }}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🔥</span>
                        <div>
                            <p className="font-black text-white text-sm">You climbed {delta} positions!</p>
                            <p className="text-xs" style={{ color: '#4ade80' }}>Now at #{rank}{pointsDelta > 0 ? ` · +${pointsDelta} pts` : ''}</p>
                        </div>
                    </div>
                    <button onClick={dismiss} className="text-white/30 hover:text-white/60 text-lg ml-3">✕</button>
                </div>
            </div>
        );
    }

    /* ── Points gained banner ───────────────────────────────────── */
    return (
        <div
            className="fixed top-0 left-0 right-0 z-50 px-4"
            style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
        >
            <div
                className="rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xl"
                style={{ background: 'rgba(245,184,0,0.09)', border: '1px solid rgba(245,184,0,0.25)', animation: 'slideDown 0.4s ease' }}
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                        <p className="font-black text-white text-sm">+{pointsDelta} points earned!</p>
                        <p className="text-xs text-white/40">You're now at #{rank}</p>
                    </div>
                </div>
                <button onClick={dismiss} className="text-white/30 hover:text-white/60 text-lg ml-3">✕</button>
            </div>
        </div>
    );
}
