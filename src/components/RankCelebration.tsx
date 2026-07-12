import { useEffect, useState, useRef } from 'react';

interface RankSnapshot { rank: number; points: number; }
function getKey(u: string) { return `knockout_rank_snapshot_${u}`; }
function load(u: string): RankSnapshot | null { try { const r = localStorage.getItem(getKey(u)); return r ? JSON.parse(r) : null; } catch { return null; } }
function save(u: string, s: RankSnapshot) { try { localStorage.setItem(getKey(u), JSON.stringify(s)); } catch {} }

interface Props { userId: string; currentRank: number | null | undefined; currentPoints: number | undefined; }

function Particles() {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const c = ref.current; if (!c) return;
        c.width = window.innerWidth; c.height = window.innerHeight;
        const ctx = c.getContext('2d')!;
        const COLS = ['#f5b800','#ffdd44','#fff','#ff8c00'];
        const ps = Array.from({ length: 80 }, () => ({
            x: Math.random() * c.width, y: c.height + 20,
            vx: (Math.random() - 0.5) * 3, vy: -(4 + Math.random() * 6),
            r: 2 + Math.random() * 5, col: COLS[~~(Math.random() * 4)], op: 1,
        }));
        let raf: number;
        const tick = () => {
            ctx.clearRect(0, 0, c.width, c.height);
            let alive = false;
            ps.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.op -= 0.01;
                if (p.y > 0 && p.op > 0) alive = true;
                ctx.save(); ctx.globalAlpha = Math.max(0, p.op);
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.col; ctx.fill(); ctx.restore();
            });
            if (alive) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);
    return <canvas ref={ref} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:59 }} />;
}

export function RankCelebration({ userId, currentRank, currentPoints }: Props) {
    const [cel, setCel] = useState<null|{ prevRank:number; delta:number; pts:number }>(null);
    const [vis, setVis] = useState(false);
    const done = useRef(false);

    useEffect(() => {
        if (!currentRank || !currentPoints || !userId || done.current) return;
        done.current = true;
        const prev = load(userId);
        if (!prev) { save(userId, { rank: currentRank, points: currentPoints }); return; }
        const d = prev.rank - currentRank;
        const p = currentPoints - prev.points;
        if (d <= 0 && p <= 0) return;
        save(userId, { rank: currentRank, points: currentPoints });
        setCel({ prevRank: prev.rank, delta: d, pts: p });
        setVis(true);
    }, [userId, currentRank, currentPoints]);

    const dismiss = () => setVis(false);
    if (!cel || !vis || !currentRank) return null;

    const { prevRank, delta, pts } = cel;
    const isTop1 = currentRank === 1;
    const isTop3 = currentRank <= 3;

    const headline = isTop1 ? "You're leading!" : isTop3 ? 'Podium finish! 🏆' : 'You climbed!';
    const subtext = isTop1
        ? 'Top of the knockout standings'
        : isTop3
        ? `#${currentRank} in the knockout standings`
        : `Now #${currentRank} in knockout standings`;

    return (
        <>
            {isTop1 && <Particles />}
            <div
                className="fixed inset-0 z-50 flex items-end justify-center"
                style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
                onClick={dismiss}
            >
                {/* Sheet */}
                <div
                    className="w-full relative overflow-hidden"
                    style={{ maxWidth: 480, borderRadius: '28px 28px 0 0', background: '#0a0a0a' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Glow blobs */}
                    <div style={{ position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)', width:300, height:200, background:'radial-gradient(ellipse, rgba(245,184,0,0.18) 0%, transparent 70%)', pointerEvents:'none' }} />

                    {/* Top accent bar */}
                    <div style={{ height: 3, background: isTop1 ? 'linear-gradient(90deg,#f5b800,#ff8c00,#f5b800)' : isTop3 ? 'linear-gradient(90deg,#c0c0c0,#fff,#c0c0c0)' : 'linear-gradient(90deg,#f5b800,#ffd700)' }} />

                    {/* Drag pill */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div style={{ width:36, height:4, borderRadius:9, background:'rgba(255,255,255,0.12)' }} />
                    </div>

                    <div className="px-7 pb-8 pt-4 space-y-6 relative">

                        {/* Rank change display */}
                        <div className="flex items-center justify-center gap-5">
                            {/* Previous rank */}
                            <div className="text-center opacity-40">
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/50">Was</p>
                                <p className="font-black tabular-nums" style={{ fontFamily:'"Bebas Neue",sans-serif', fontSize:'3rem', lineHeight:1, color:'rgba(255,255,255,0.3)' }}>
                                    #{prevRank}
                                </p>
                            </div>

                            {/* Arrow */}
                            <div className="flex flex-col items-center">
                                <svg width="40" height="40" viewBox="0 0 40 40">
                                    <defs>
                                        <linearGradient id="arrowGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#f5b800" />
                                            <stop offset="100%" stopColor="#ff8c00" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M8 20 L28 20 M22 12 L30 20 L22 28" stroke="url(#arrowGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </svg>
                                {delta > 0 && (
                                    <span className="text-[10px] font-black" style={{ color:'#f5b800' }}>+{delta}</span>
                                )}
                            </div>

                            {/* New rank — hero number */}
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color:'rgba(245,184,0,0.6)' }}>Now</p>
                                <p
                                    className="font-black tabular-nums"
                                    style={{
                                        fontFamily:'"Bebas Neue",sans-serif',
                                        fontSize: isTop1 ? '4.5rem' : '4rem',
                                        lineHeight: 1,
                                        color: isTop1 ? '#f5b800' : isTop3 ? '#e8e8e8' : '#fff',
                                        textShadow: isTop1 ? '0 0 40px rgba(245,184,0,0.6)' : 'none',
                                    }}
                                >
                                    #{currentRank}
                                </p>
                            </div>
                        </div>

                        {/* Headline */}
                        <div className="text-center">
                            <h2
                                className="font-black text-white"
                                style={{ fontFamily:'"Bebas Neue",sans-serif', fontSize:'1.8rem', letterSpacing:'0.05em' }}
                            >
                                {headline}
                            </h2>
                            <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.4)' }}>{subtext}</p>
                        </div>

                        {/* Pts badge */}
                        {pts > 0 && (
                            <div className="flex justify-center">
                                <div
                                    className="flex items-center gap-2 rounded-2xl px-5 py-2.5"
                                    style={{ background:'rgba(245,184,0,0.09)', border:'1px solid rgba(245,184,0,0.2)' }}
                                >
                                    <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>this round</span>
                                    <span
                                        className="font-black"
                                        style={{ fontFamily:'"Bebas Neue",sans-serif', fontSize:'1.6rem', color:'#f5b800' }}
                                    >
                                        +{pts} PTS
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        <button
                            onClick={dismiss}
                            className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest"
                            style={{ background:'linear-gradient(135deg,#f5b800,#ff8c00)', color:'#000' }}
                        >
                            {isTop1 ? "Let's stay #1 👑" : isTop3 ? 'Keep climbing 🏆' : 'Keep it up 🔥'}
                        </button>

                        <p
                            className="text-center text-xs cursor-pointer"
                            style={{ color:'rgba(255,255,255,0.2)' }}
                            onClick={dismiss}
                        >
                            Tap anywhere to dismiss
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
