import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { pollsApi, Poll, PollOption } from '../api/polls';
import { DateTime } from 'luxon';

/* ─── safe image with gradient fallback ───────────────────────── */
const GRADIENTS = [
    'linear-gradient(135deg,#1a1a2e,#16213e)',
    'linear-gradient(135deg,#0d1b2a,#1b263b)',
    'linear-gradient(135deg,#1b1b2f,#2e2e5e)',
    'linear-gradient(135deg,#1a1a1a,#2d2d2d)',
    'linear-gradient(135deg,#0f2027,#203a43)',
    'linear-gradient(135deg,#1c1c1c,#3a3a3a)',
    'linear-gradient(135deg,#141e30,#243b55)',
    'linear-gradient(135deg,#0c0c0c,#1a1a1a)',
];

function SafeImage({ src, alt, index, className, style }: {
    src: string | null;
    alt: string;
    index: number;
    className?: string;
    style?: React.CSSProperties;
}) {
    const [failed, setFailed] = useState(false);
    const grad = GRADIENTS[index % GRADIENTS.length];
    if (!src || failed) {
        return (
            <div
                className={`w-full h-full flex items-end justify-start p-2 ${className ?? ''}`}
                style={{ background: grad, ...style }}
            />
        );
    }
    return <img src={src} alt={alt} className={`w-full h-full object-cover ${className ?? ''}`} style={style} onError={() => setFailed(true)} />;
}

/* ─── helpers ─────────────────────────────────────────────────── */
function timeUntil(iso: string): string {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) return 'Closed';
    const h = Math.floor(diff / 3_600_000);
    if (h < 1) return `Closes in <1h`;
    if (h < 24) return `Closes in ${h}h`;
    return `Closes in ${Math.floor(h / 24)}d`;
}

/* ─── single poll card ────────────────────────────────────────── */
function PollCard({ poll }: { poll: Poll }) {
    const queryClient = useQueryClient();
    const [optimisticVote, setOptimisticVote] = useState<number | null>(null);

    const voteMutation = useMutation({
        mutationFn: (idx: number) => pollsApi.vote(poll.id, idx),
        onMutate: (idx) => setOptimisticVote(idx),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['polls'] }); setOptimisticVote(null); },
        onError: () => setOptimisticVote(null),
    });

    const userVote = optimisticVote ?? poll.userVote;
    const hasVoted = userVote !== null;
    const showResults = hasVoted || poll.isClosed;

    const getVotes = (idx: number) => {
        if (optimisticVote === null) return poll.options[idx]?.votes ?? 0;
        return idx === optimisticVote ? (poll.options[idx]?.votes ?? 0) + 1 : (poll.options[idx]?.votes ?? 0);
    };
    const optimisticTotal = optimisticVote !== null ? poll.totalVotes + 1 : poll.totalVotes;
    const getPct = (idx: number) =>
        optimisticTotal > 0 ? Math.round((getVotes(idx) / optimisticTotal) * 100) : 0;

    const sortedOptions: PollOption[] = showResults
        ? [...poll.options].sort((a, b) => getVotes(b.index) - getVotes(a.index))
        : poll.options;

    const leadIndex = showResults ? sortedOptions[0]?.index : null;
    const hasImages = poll.options.some((o) => o.image);

    /* ── image-card layout (used when any option has an image) ── */
    if (hasImages) {
        return (
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                {/* Header */}
                <div className="px-5 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2.5">
                            {poll.emoji && <span className="text-2xl">{poll.emoji}</span>}
                            <h3 className="font-black text-white leading-snug" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.2rem', letterSpacing: '0.04em' }}>
                                {poll.question}
                            </h3>
                        </div>
                        <StatusBadge poll={poll} />
                    </div>
                    <p className="text-xs text-white/30">{optimisticTotal} vote{optimisticTotal !== 1 ? 's' : ''}</p>
                </div>

                {/* Image grid */}
                {!showResults ? (
                    <div className={`grid gap-3 px-5 pb-5 ${sortedOptions.length <= 2 ? 'grid-cols-2' : sortedOptions.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {sortedOptions.map((opt) => (
                            <button
                                key={opt.index}
                                disabled={voteMutation.isPending}
                                onClick={() => voteMutation.mutate(opt.index)}
                                className="group relative rounded-xl overflow-hidden transition-all duration-200 text-left"
                                style={{ aspectRatio: '3/4', border: '2px solid rgba(255,255,255,0.08)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(245,184,0,0.5)')}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                            >
                                {opt.image ? (
                                    <SafeImage src={opt.image} alt={opt.label} index={opt.index} className="w-full h-full" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center" style={{ background: GRADIENTS[opt.index % GRADIENTS.length] }}>
                                        <span className="text-4xl font-black opacity-20" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>{opt.label.charAt(0)}</span>
                                    </div>
                                )}
                                <div
                                    className="absolute inset-0 flex items-end p-3"
                                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }}
                                >
                                    <span className="text-white text-xs font-bold leading-tight">{opt.label}</span>
                                </div>
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ background: 'rgba(245,184,0,0.15)' }}>
                                    <span className="text-white font-black text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg" style={{ background: 'rgba(245,184,0,0.9)', color: '#000' }}>Vote</span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    /* Results with images */
                    <div className="space-y-2 px-5 pb-5">
                        {sortedOptions.map((opt, rank) => {
                            const votes = getVotes(opt.index);
                            const pct = getPct(opt.index);
                            const isMyVote = userVote === opt.index;
                            const isWinner = opt.index === leadIndex && optimisticTotal > 0;

                            return (
                                <div
                                    key={opt.index}
                                    className="relative rounded-xl overflow-hidden flex items-center gap-3"
                                    style={{
                                        background: isMyVote ? 'rgba(245,184,0,0.07)' : 'rgba(255,255,255,0.03)',
                                        border: isMyVote ? '1px solid rgba(245,184,0,0.25)' : '1px solid rgba(255,255,255,0.06)',
                                        padding: '10px',
                                    }}
                                >
                                    {/* Animated fill bar */}
                                    <div
                                        className="absolute inset-0 transition-all duration-700 rounded-xl"
                                        style={{
                                            width: `${pct}%`,
                                            background: isMyVote
                                                ? 'rgba(245,184,0,0.08)'
                                                : isWinner
                                                ? 'rgba(34,197,94,0.06)'
                                                : 'rgba(255,255,255,0.03)',
                                        }}
                                    />

                                    {/* Image */}
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                        <SafeImage src={opt.image} alt={opt.label} index={opt.index} className="w-full h-full" />
                                    </div>

                                    {/* Label + badges */}
                                    <div className="relative flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-sm font-bold" style={{ color: isMyVote ? '#f5b800' : 'rgba(255,255,255,0.9)' }}>
                                                {opt.label}
                                            </span>
                                            {isMyVote && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,184,0,0.15)', color: '#f5b800' }}>your pick</span>
                                            )}
                                            {isWinner && rank === 0 && optimisticTotal > 0 && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
                                                    {isMyVote ? '🏆 winning' : '🏆 leading'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: isMyVote ? 'linear-gradient(90deg,#f5b800,#ff8c00)' : isWinner ? '#4ade80' : 'rgba(255,255,255,0.3)',
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold flex-shrink-0" style={{ color: isMyVote ? '#f5b800' : 'rgba(255,255,255,0.4)', width: '2.5rem', textAlign: 'right' }}>
                                                {pct}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    /* ── text-only layout ─────────────────────────────────────── */
    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
            {/* Header */}
            <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                        {poll.emoji && <span className="text-2xl flex-shrink-0">{poll.emoji}</span>}
                        <div>
                            <h3 className="font-black text-white leading-snug" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.2rem', letterSpacing: '0.04em' }}>
                                {poll.question}
                            </h3>
                            <p className="text-xs text-white/30 mt-0.5">{optimisticTotal} vote{optimisticTotal !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <StatusBadge poll={poll} />
                </div>
            </div>

            {/* Options */}
            <div className="px-5 py-4 space-y-2">
                {sortedOptions.map((opt) => {
                    const votes = getVotes(opt.index);
                    const pct = getPct(opt.index);
                    const isMyVote = userVote === opt.index;
                    const isWinner = opt.index === leadIndex && optimisticTotal > 0;

                    if (!showResults) {
                        return (
                            <button
                                key={opt.index}
                                disabled={voteMutation.isPending}
                                onClick={() => voteMutation.mutate(opt.index)}
                                className="w-full text-left rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-150 group"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.09)',
                                    color: 'rgba(255,255,255,0.85)',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(245,184,0,0.10)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,184,0,0.35)';
                                    (e.currentTarget as HTMLElement).style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)';
                                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                                }}
                            >
                                {opt.label}
                            </button>
                        );
                    }

                    return (
                        <div
                            key={opt.index}
                            className="relative rounded-xl overflow-hidden px-4 py-3"
                            style={{
                                background: isMyVote ? 'rgba(245,184,0,0.06)' : 'rgba(255,255,255,0.03)',
                                border: isMyVote ? '1px solid rgba(245,184,0,0.2)' : '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            {/* Fill */}
                            <div
                                className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700"
                                style={{
                                    width: `${pct}%`,
                                    background: isMyVote ? 'rgba(245,184,0,0.07)' : isWinner ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.03)',
                                }}
                            />
                            <div className="relative flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                    <span className="text-sm font-bold" style={{ color: isMyVote ? '#f5b800' : 'rgba(255,255,255,0.9)' }}>
                                        {opt.label}
                                    </span>
                                    {isMyVote && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,184,0,0.15)', color: '#f5b800' }}>your pick</span>
                                    )}
                                    {isWinner && !isMyVote && optimisticTotal > 0 && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>leading</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 text-xs">
                                    <span className="text-white/30">{votes}</span>
                                    <span className="font-bold w-10 text-right" style={{ color: isMyVote ? '#f5b800' : isWinner ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
                                        {pct}%
                                    </span>
                                </div>
                            </div>
                            {/* Bar */}
                            <div className="relative mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${pct}%`,
                                        background: isMyVote ? 'linear-gradient(90deg,#f5b800,#ff8c00)' : isWinner ? '#4ade80' : 'rgba(255,255,255,0.3)',
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── status badge ────────────────────────────────────────────── */
function StatusBadge({ poll }: { poll: Poll }) {
    if (poll.isClosed) {
        return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 uppercase tracking-wider" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>Closed</span>;
    }
    if (poll.closesAt) {
        return <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 uppercase tracking-wider" style={{ background: 'rgba(245,184,0,0.12)', color: '#f5b800' }}>{timeUntil(poll.closesAt)}</span>;
    }
    return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 uppercase tracking-wider" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            Live
        </span>
    );
}

/* ─── page ────────────────────────────────────────────────────── */
export default function PollsPage() {
    const { data: polls = [], isLoading } = useQuery({
        queryKey: ['polls'],
        queryFn: pollsApi.getPolls,
        refetchInterval: 30_000,
    });

    const openPolls = polls.filter((p) => !p.isClosed);
    const closedPolls = polls.filter((p) => p.isClosed);

    return (
        <div className="min-h-screen pb-20 sm:pb-8" style={{ background: '#0a0a0a' }}>
            <Header />
            <main className="max-w-2xl mx-auto px-4 py-5 space-y-6">

                {/* Page title */}
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(245,184,0,0.6)' }}>
                        Community
                    </div>
                    <h1 className="font-black text-white" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', letterSpacing: '0.06em' }}>
                        Polls
                    </h1>
                    <p className="text-xs text-white/30 mt-0.5">Cast your votes — results update in real time</p>
                </div>

                {isLoading && (
                    <div className="flex items-center gap-2 py-8 justify-center">
                        <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(245,184,0,0.3)', borderTopColor: '#f5b800' }} />
                        <span className="text-white/30 text-sm">Loading polls…</span>
                    </div>
                )}

                {!isLoading && polls.length === 0 && (
                    <div className="text-center py-16 space-y-2">
                        <p className="text-4xl">🗳️</p>
                        <p className="text-white/40 text-sm">No polls yet — check back soon!</p>
                    </div>
                )}

                {/* Live polls */}
                {openPolls.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                Live Polls · {openPolls.length}
                            </span>
                        </div>
                        {openPolls.map((poll) => <PollCard key={poll.id} poll={poll} />)}
                    </section>
                )}

                {/* Closed polls */}
                {closedPolls.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-0.5 h-4 rounded-full bg-white/20" />
                            <span className="text-xs font-black uppercase tracking-widest text-white/30">
                                Closed · {closedPolls.length}
                            </span>
                        </div>
                        {closedPolls.map((poll) => <PollCard key={poll.id} poll={poll} />)}
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
}
