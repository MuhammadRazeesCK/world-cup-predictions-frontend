import { useEffect, useState, useRef } from 'react';

interface RankSnapshot { rank: number; points: number; }

function getKey(userId: string) { return `knockout_rank_snapshot_${userId}`; }

function loadSnapshot(userId: string): RankSnapshot | null {
    try { const r = localStorage.getItem(getKey(userId)); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveSnapshot(userId: string, s: RankSnapshot) {
    try { localStorage.setItem(getKey(userId), JSON.stringify(s)); } catch {}
}

interface Props { userId: string; currentRank: number | null | undefined; currentPoints: number | undefined; }

/* ─── confetti ────────────────────────────────────────────────── */
function Confetti() {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const c = ref.current; if (!c) return;
        const ctx = c.getContext('2d')!;
        c.width = window.innerWidth; c.height = window.innerHeight;
        const COLS = ['#f5b800','#fff','#4ade80','#f87171','#60a5fa','#fb923c'];
        const ps = Array.from({ length: 100 }, () => ({
            x: Math.random() * c.width, y: -20 - Math.random() * 200,
            r: 4 + Math.random() * 6, col: COLS[Math.floor(Math.random() * 6)],
            vx: (Math.random() - 0.5) * 5, vy: 3 + Math.random() * 5,
            rot: Math.random() * Math.PI * 2, vrot: (Math.random() - 0.5) * 0.25, op: 1,
        }));
        let raf: number;
        const tick = () => {
            ctx.clearRect(0, 0, c.width, c.height);
            let alive = false;
            ps.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.rot += p.vrot; p.vy += 0.1; p.op -= 0.006;
                if (p.y < c.height && p.op > 0) alive = true;
                ctx.save(); ctx.globalAlpha = Math.max(0, p.op); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
                ctx.fillStyle = p.col; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r); ctx.restore();
            });
            if (alive) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);
    return <canvas ref={ref} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:59 }} />;
}

/* ─── main ────────────────────────────────────────────────────── */
export function RankCelebration({ userId, currentRank, currentPoints }: Props) {
    const [cel, setCel] = useState<null | { type: 'gold'|'podium'|'climb'|'points'; rank:number; delta:number; pts:number }>(null);
    const [vis, setVis] = useState(false);
    const done = useRef(false);

    useEffect(() => {
        if (!currentRank || !currentPoints || !userId || done.current) return;
        done.current = true;
        const prev = loadSnapshot(userId);
        if (!prev) { saveSnapshot(userId, { rank: currentRank, points: currentPoints }); return; }
        const d = prev.rank - currentRank;
        const p = currentPoints - prev.points;
        if (d <= 0 && p <= 0) return;
        saveSnapshot(userId, { rank: currentRank, points: currentPoints });
        let type: 'gold'|'podium'|'climb'|'points' = 'points';
        if (currentRank === 1) type = 'gold';
        else if (currentRank <= 3) type = 'podium';
        else if (d >= 2) type = 'climb';
        setCel({ type, rank: currentRank, delta: d, pts: p });
        setVis(true);
    }, [userId, currentRank, currentPoints]);

    const dismiss = () => setVis(false);
    if (!cel || !vis) return null;
    const { type, rank, delta, pts } = cel;

    /* shared overlay backdrop */
    const Backdrop = ({ children }: { children: React.ReactNode }) => (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)' }}
            onClick={dismiss}
        >
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, margin: '0 16px 24px' }}>
                {children}
            </div>
        </div>
    );

    /* ── #1 GOLD BURST ──────────────────────────────────────────── */
    if (type === 'gold') return (
        <>
            <Confetti />
            <Backdrop>
                <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a1400, #0d0d0d)', border: '1px solid rgba(245,184,0,0.5)', boxShadow: '0 0 80px rgba(245,184,0,0.25)' }}>
                    {/* Gold glow bar */}
                    <div style={{ height: 4, background: 'linear-gradient(90deg,#f5b800,#ff8c00,#f5b800)' }} />
                    <div className="p-8 text-center space-y-4">
                        <div style={{ fontSize: '4.5rem', lineHeight: 1, filter: 'drop-shadow(0 0 24px rgba(245,184,0,0.6))' }}>👑</div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(245,184,0,0.6)' }}>You are now</p>
                            <h1 className="font-black" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '5rem', lineHeight: 0.9, color: '#f5b800', textShadow: '0 0 40px rgba(245,184,0,0.5)' }}>
                                #1
                            </h1>
                            <p className="text-white font-bold text-lg mt-1">in the Knockout Standings</p>
                        </div>
                        {pts > 0 && (
                            <div className="rounded-2xl py-3 px-6 inline-block" style={{ background: 'rgba(245,184,0,0.12)', border: '1px solid rgba(245,184,0,0.2)' }}>
                                <span className="font-black text-2xl" style={{ color: '#f5b800', fontFamily: '"Bebas Neue", sans-serif' }}>+{pts} PTS</span>
                                <span className="text-white/40 text-sm ml-2">this round</span>
                            </div>
                        )}
                        <button onClick={dismiss} className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest mt-2" style={{ background: 'linear-gradient(135deg,#f5b800,#ff8c00)', color: '#000' }}>
                            Let's Go! 🔥
                        </button>
                    </div>
                </div>
            </Backdrop>
        </>
    );

    /* ── TOP 3 PODIUM ───────────────────────────────────────────── */
    if (type === 'podium') {
        const medal = rank === 2 ? '🥈' : '🥉';
        const accentColor = rank === 2 ? '#c0c0c0' : '#cd7f32';
        return (
            <Backdrop>
                <div className="rounded-3xl overflow-hidden" style={{ background: '#0d0d0d', border: `1px solid ${accentColor}55`, boxShadow: `0 0 60px ${accentColor}22` }}>
                    <div style={{ height: 3, background: `linear-gradient(90deg,${accentColor},${accentColor}88,${accentColor})` }} />
                    <div className="p-8 text-center space-y-4">
                        <div style={{ fontSize: '4rem', lineHeight: 1 }}>{medal}</div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: `${accentColor}99` }}>You're on the podium</p>
                            <h1 className="font-black" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '4.5rem', lineHeight: 0.9, color: accentColor }}>
                                #{rank}
                            </h1>
                            <p className="text-white/60 text-sm mt-1">Knockout Standings</p>
                        </div>
                        {delta > 0 && (
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-green-400 font-black text-lg">↑ {delta} position{delta !== 1 ? 's' : ''}</span>
                                {pts > 0 && <span className="text-white/30">·</span>}
                                {pts > 0 && <span className="font-bold" style={{ color: '#f5b800' }}>+{pts} pts</span>}
                            </div>
                        )}
                        <button onClick={dismiss} className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest" style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}44`, color: accentColor }}>
                            Keep it up 💪
                        </button>
                    </div>
                </div>
            </Backdrop>
        );
    }

    /* ── RANK CLIMB ─────────────────────────────────────────────── */
    return (
        <Backdrop>
            <div className="rounded-3xl overflow-hidden" style={{ background: '#0d0d0d', border: '1px solid rgba(34,197,94,0.35)', boxShadow: '0 0 50px rgba(34,197,94,0.1)' }}>
                <div style={{ height: 3, background: 'linear-gradient(90deg,#4ade80,#22c55e,#4ade80)' }} />
                <div className="p-7 text-center space-y-4">
                    <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>🚀</div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(74,222,128,0.6)' }}>Rank up!</p>
                        <h1 className="font-black" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '4.5rem', lineHeight: 0.9, color: '#4ade80' }}>
                            #{rank}
                        </h1>
                        {delta > 0 && (
                            <p className="text-white font-bold text-base mt-1">
                                Climbed <span style={{ color: '#4ade80' }}>{delta} position{delta !== 1 ? 's' : ''}</span> in Knockout
                            </p>
                        )}
                    </div>
                    {pts > 0 && (
                        <div className="rounded-2xl py-2.5 px-5 inline-block" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                            <span className="font-black text-xl" style={{ color: '#4ade80', fontFamily: '"Bebas Neue", sans-serif' }}>+{pts} PTS</span>
                        </div>
                    )}
                    <button onClick={dismiss} className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest" style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>
                        Let's Go! 🔥
                    </button>
                </div>
            </div>
        </Backdrop>
    );
}
