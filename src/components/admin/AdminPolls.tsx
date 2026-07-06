import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pollsApi } from '../../api/polls';
import { Alert } from '../common/Alert';
import { DateTime } from 'luxon';

function formatTime(iso: string) {
    return DateTime.fromISO(iso).setZone('Asia/Kolkata').toFormat('d MMM yyyy, h:mm a');
}

/* ─── vote breakdown ─────────────────────────────────────────── */
function VoteBreakdown({ pollId }: { pollId: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-poll-votes', pollId],
        queryFn: () => pollsApi.adminGetPollVotes(pollId),
    });

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 py-4">
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(245,184,0,0.4)', borderTopColor: 'transparent' }} />
                <span className="text-xs text-white/30">Loading votes…</span>
            </div>
        );
    }
    if (!data) return null;

    const maxVotes = Math.max(...data.byOption.map(o => o.voters.length), 1);

    return (
        <div className="space-y-4">
            {data.byOption.map((opt) => {
                const pct = Math.round((opt.voters.length / maxVotes) * 100);
                return (
                    <div key={opt.index}>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-white/80">{opt.label}</span>
                            <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(245,184,0,0.1)', color: '#f5b800' }}
                            >
                                {opt.voters.length}
                            </span>
                        </div>
                        <div className="h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #f5b800, #ff8c00)' }}
                            />
                        </div>
                        {opt.voters.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {opt.voters.map((username) => (
                                    <span
                                        key={username}
                                        className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
                                    >
                                        @{username}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-white/20 italic">No votes yet</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ─── option row in create form ──────────────────────────────── */
function OptionRow({
    index,
    label,
    image,
    onLabelChange,
    onImageChange,
    onRemove,
    canRemove,
}: {
    index: number;
    label: string;
    image: string;
    onLabelChange: (v: string) => void;
    onImageChange: (v: string) => void;
    onRemove: () => void;
    canRemove: boolean;
}) {
    const [imgFailed, setImgFailed] = useState(false);
    // Reset failed state when image URL changes
    const handleImageChange = (v: string) => { setImgFailed(false); onImageChange(v); };

    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
            <div className="flex items-center gap-3 p-3">
                {/* Image preview */}
                <div
                    className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center relative"
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${image && !imgFailed ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}` }}
                >
                    {image && !imgFailed ? (
                        <img
                            src={image}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={() => setImgFailed(true)}
                        />
                    ) : image && imgFailed ? (
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-red-400 text-base">⚠️</span>
                            <span className="text-[9px] text-red-400/70 font-bold text-center leading-tight px-1">blocked</span>
                        </div>
                    ) : (
                        <span className="text-white/20 text-lg">📷</span>
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    <input
                        className="w-full bg-transparent text-sm font-medium text-white placeholder-white/20 outline-none border-b border-white/10 pb-1 focus:border-yellow-400/50"
                        placeholder={`Option ${index + 1} label`}
                        value={label}
                        onChange={(e) => onLabelChange(e.target.value)}
                    />
                    <input
                        className="w-full bg-transparent text-xs text-white/40 placeholder-white/20 outline-none"
                        placeholder="Image URL — use imgur.com or ibb.co (not Google Images)"
                        value={image}
                        onChange={(e) => handleImageChange(e.target.value)}
                    />
                </div>

                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}

/* ─── main component ─────────────────────────────────────────── */
export function AdminPolls() {
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [expandedVotes, setExpandedVotes] = useState<string | null>(null);
    const [editingImages, setEditingImages] = useState<string | null>(null);
    const [draftImages, setDraftImages] = useState<string[]>([]);

    // Create form
    const [question, setQuestion] = useState('');
    const [emoji, setEmoji] = useState('');
    const [options, setOptions] = useState([
        { label: '', image: '' },
        { label: '', image: '' },
    ]);
    const [closesAt, setClosesAt] = useState('');

    const { data: polls = [], isLoading } = useQuery({
        queryKey: ['admin-polls'],
        queryFn: pollsApi.adminGetPolls,
    });

    const createMutation = useMutation({
        mutationFn: () => {
            // Keep only options with a non-empty label, preserving image alignment
            const validOptions = options.filter((o) => o.label.trim());
            const labels = validOptions.map((o) => o.label.trim());
            const images = validOptions.map((o) => o.image.trim() || null);
            return pollsApi.adminCreatePoll({
                question: question.trim(),
                options: labels,
                option_images: images,
                emoji: emoji.trim() || undefined,
                closes_at: closesAt ? `${closesAt}:00+05:30` : undefined,
            });
        },
        onSuccess: () => {
            setSuccess('Poll created!');
            setQuestion(''); setEmoji(''); setOptions([{ label: '', image: '' }, { label: '', image: '' }]); setClosesAt('');
            queryClient.invalidateQueries({ queryKey: ['admin-polls'] });
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (err: any) => setError(err.response?.data?.error || 'Failed to create poll'),
    });

    const patchMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: any }) =>
            pollsApi.adminPatchPoll(id, updates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-polls'] }),
        onError: (err: any) => setError(err.response?.data?.error || 'Failed to update poll'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => pollsApi.adminDeletePoll(id),
        onSuccess: () => {
            setSuccess('Poll deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-polls'] });
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (err: any) => setError(err.response?.data?.error || 'Failed to delete poll'),
    });

    const saveImagesMutation = useMutation({
        mutationFn: ({ id, images }: { id: string; images: (string | null)[] }) =>
            pollsApi.adminPatchPoll(id, { option_images: images }),
        onSuccess: () => {
            setSuccess('Images saved!');
            setEditingImages(null);
            queryClient.invalidateQueries({ queryKey: ['admin-polls'] });
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (err: any) => setError(err.response?.data?.error || 'Failed to save images'),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!question.trim()) { setError('Question is required'); return; }
        const valid = options.filter((o) => o.label.trim());
        if (valid.length < 2) { setError('At least 2 options required'); return; }
        createMutation.mutate();
    };

    return (
        <div className="space-y-6">

            {/* ── Create form ─────────────────────────────────── */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(245,184,0,0.04) 0%, rgba(255,140,0,0.02) 100%)',
                    border: '1px solid rgba(245,184,0,0.15)',
                }}
            >
                <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(245,184,0,0.1)' }}>
                    <span className="text-xl">🗳️</span>
                    <h2 className="font-black text-white text-base" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em', fontSize: '1.1rem' }}>
                        CREATE NEW POLL
                    </h2>
                </div>

                <div className="px-6 py-5">
                    {success && <div className="mb-4"><Alert type="success" message={success} /></div>}
                    {error && <div className="mb-4"><Alert type="error" message={error} onDismiss={() => setError('')} /></div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Question row */}
                        <div className="grid grid-cols-8 gap-3">
                            <div className="col-span-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Emoji</p>
                                <input
                                    className="w-full rounded-xl text-center text-2xl py-3"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', color: 'white' }}
                                    placeholder="🏆"
                                    value={emoji}
                                    onChange={(e) => setEmoji(e.target.value)}
                                    maxLength={4}
                                />
                            </div>
                            <div className="col-span-7">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Question</p>
                                <input
                                    className="w-full rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-white/20"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
                                    placeholder="Who will win the Golden Boot? 🥾"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Options */}
                        <div>
                            <div className="flex items-center justify-between mb-2.5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Options ({options.length}/8)</p>
                                {options.length < 8 && (
                                    <button
                                        type="button"
                                        onClick={() => setOptions([...options, { label: '', image: '' }])}
                                        className="text-xs font-bold px-3 py-1 rounded-lg transition-all"
                                        style={{ background: 'rgba(245,184,0,0.1)', color: '#f5b800' }}
                                    >
                                        + Add option
                                    </button>
                                )}
                            </div>                            <p className="text-[10px] text-white/20 mb-2">For images, use a direct URL from <span style={{color:'rgba(245,184,0,0.5)'}}>imgur.com</span>, <span style={{color:'rgba(245,184,0,0.5)'}}>i.ibb.co</span>, or any CDN — not Google Images (hotlink protected).</p>                            <div className="space-y-2">
                                {options.map((opt, i) => (
                                    <OptionRow
                                        key={i}
                                        index={i}
                                        label={opt.label}
                                        image={opt.image}
                                        onLabelChange={(v) => setOptions(options.map((o, j) => j === i ? { ...o, label: v } : o))}
                                        onImageChange={(v) => setOptions(options.map((o, j) => j === i ? { ...o, image: v } : o))}
                                        onRemove={() => setOptions(options.filter((_, j) => j !== i))}
                                        canRemove={options.length > 2}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Closes at */}
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
                                Closes At <span className="font-normal opacity-60">(IST — leave blank to keep open forever)</span>
                            </p>
                            <input
                                type="datetime-local"
                                className="w-full rounded-xl px-4 py-3 text-sm text-white"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', colorScheme: 'dark' }}
                                value={closesAt}
                                onChange={(e) => setClosesAt(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all"
                            style={{
                                background: createMutation.isPending ? 'rgba(245,184,0,0.3)' : 'linear-gradient(135deg, #f5b800, #ff8c00)',
                                color: '#000',
                            }}
                        >
                            {createMutation.isPending ? 'Creating…' : 'Create Poll'}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Poll list ────────────────────────────────────── */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="w-0.5 h-4 rounded-full" style={{ background: '#f5b800' }} />
                    <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        All Polls ({polls.length})
                    </h2>
                </div>

                {isLoading && (
                    <div className="flex items-center gap-2 p-4">
                        <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(245,184,0,0.3)', borderTopColor: '#f5b800' }} />
                        <span className="text-sm text-white/30">Loading…</span>
                    </div>
                )}

                {!isLoading && polls.length === 0 && (
                    <div className="text-center py-12 text-white/20 text-sm">No polls yet — create one above.</div>
                )}

                {polls.map((poll: any) => {
                    const isClosed = poll.closes_at && new Date(poll.closes_at) <= new Date();
                    const isVoteExpanded = expandedVotes === poll.id;
                    const isImgExpanded = editingImages === poll.id;
                    const imgs: (string | null)[] = poll.option_images ?? poll.options.map(() => null);

                    // Status config
                    const statusCfg = !poll.is_active
                        ? { label: 'Hidden', bg: 'rgba(100,100,100,0.15)', color: '#6b7280' }
                        : isClosed
                        ? { label: 'Closed', bg: 'rgba(239,68,68,0.12)', color: '#f87171' }
                        : { label: 'Live', bg: 'rgba(34,197,94,0.12)', color: '#4ade80' };

                    return (
                        <div
                            key={poll.id}
                            className="rounded-2xl overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            {/* Card header */}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                        {poll.emoji && (
                                            <span className="text-2xl flex-shrink-0">{poll.emoji}</span>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-bold text-white text-sm leading-snug">{poll.question}</p>
                                            <p className="text-[11px] text-white/30 mt-0.5">
                                                {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
                                                {poll.closes_at ? ` · Closes ${formatTime(poll.closes_at)}` : ' · No expiry'}
                                                {` · Created ${formatTime(poll.created_at)}`}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                                        style={{ background: statusCfg.bg, color: statusCfg.color }}
                                    >
                                        {statusCfg.label}
                                    </span>
                                </div>

                                {/* Option chips with images */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {(poll.options as string[]).map((opt: string, i: number) => {
                                        const img = imgs[i];
                                        return (
                                            <div
                                                key={i}
                                                className="flex items-center gap-1.5 rounded-lg px-2 py-1"
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                                            >
                                                {img ? (
                                                    <img src={img} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                                        {i + 1}
                                                    </div>
                                                )}
                                                <span className="text-xs text-white/60">{opt}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setExpandedVotes(isVoteExpanded ? null : poll.id)}
                                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                                        style={{
                                            background: isVoteExpanded ? 'rgba(245,184,0,0.15)' : 'rgba(255,255,255,0.06)',
                                            color: isVoteExpanded ? '#f5b800' : 'rgba(255,255,255,0.5)',
                                        }}
                                    >
                                        👁 {isVoteExpanded ? 'Hide' : 'View'} Votes
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (isImgExpanded) {
                                                setEditingImages(null);
                                            } else {
                                                setDraftImages((poll.option_images ?? poll.options.map(() => '')) as string[]);
                                                setEditingImages(poll.id);
                                            }
                                        }}
                                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                                        style={{
                                            background: isImgExpanded ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)',
                                            color: isImgExpanded ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                                        }}
                                    >
                                        🖼 {isImgExpanded ? 'Cancel' : 'Edit Images'}
                                    </button>
                                    <button
                                        onClick={() => patchMutation.mutate({ id: poll.id, updates: { is_active: !poll.is_active } })}
                                        disabled={patchMutation.isPending}
                                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                                    >
                                        {poll.is_active ? 'Hide' : 'Show'}
                                    </button>
                                    {poll.is_active && !isClosed && (
                                        <button
                                            onClick={() => patchMutation.mutate({ id: poll.id, updates: { closes_at: new Date().toISOString() } })}
                                            disabled={patchMutation.isPending}
                                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                                            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                                        >
                                            Close Now
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete this poll and all its votes?')) deleteMutation.mutate(poll.id);
                                        }}
                                        disabled={deleteMutation.isPending}
                                        className="text-xs px-3 py-1.5 rounded-lg font-medium ml-auto"
                                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                                    >
                                        🗑 Delete
                                    </button>
                                </div>
                            </div>

                            {/* Edit images panel */}
                            {isImgExpanded && (
                                <div
                                    className="px-4 pb-4 pt-3 space-y-3"
                                    style={{ borderTop: '1px solid rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.03)' }}
                                >
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/70">Edit Option Images</p>
                                    {(poll.options as string[]).map((opt: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                            >
                                                {draftImages[i] ? (
                                                    <img src={draftImages[i]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white/20 text-sm">📷</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-white/50 mb-1">{opt}</p>
                                                <input
                                                    className="w-full rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20"
                                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }}
                                                    placeholder="Image URL"
                                                    value={draftImages[i] ?? ''}
                                                    onChange={(e) => {
                                                        const next = [...draftImages];
                                                        next[i] = e.target.value;
                                                        setDraftImages(next);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => saveImagesMutation.mutate({
                                            id: poll.id,
                                            images: draftImages.map((u) => u.trim() || null),
                                        })}
                                        disabled={saveImagesMutation.isPending}
                                        className="w-full py-2 rounded-xl text-xs font-bold uppercase tracking-widest"
                                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
                                    >
                                        {saveImagesMutation.isPending ? 'Saving…' : 'Save Images'}
                                    </button>
                                </div>
                            )}

                            {/* Vote breakdown panel */}
                            {isVoteExpanded && (
                                <div
                                    className="px-4 pb-4 pt-3"
                                    style={{ borderTop: '1px solid rgba(245,184,0,0.08)', background: 'rgba(245,184,0,0.02)' }}
                                >
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/50 mb-3">Who Voted For Whom</p>
                                    <VoteBreakdown pollId={poll.id} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
