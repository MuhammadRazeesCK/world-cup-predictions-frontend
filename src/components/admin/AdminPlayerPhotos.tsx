import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { statsApi } from '../../api/stats';

export function AdminPlayerPhotos() {
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [editingName, setEditingName] = useState<string | null>(null);
    const [draftUrl, setDraftUrl] = useState('');
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [msg, setMsg] = useState('');

    const { data: saved = [] } = useQuery({
        queryKey: ['admin-player-photos'],
        queryFn: adminApi.getPlayerPhotos,
    });

    // Load current stats leaders to show who needs photos
    const { data: stats } = useQuery({
        queryKey: ['tournament-stats'],
        queryFn: statsApi.getTournament,
        staleTime: 5 * 60_000,
    });

    const saveMutation = useMutation({
        mutationFn: ({ name, url }: { name: string; url: string }) =>
            adminApi.setPlayerPhoto(name, url),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-player-photos'] });
            setEditingName(null);
            setMsg('Saved!');
            setTimeout(() => setMsg(''), 2000);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (name: string) => adminApi.deletePlayerPhoto(name),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-player-photos'] }),
    });

    const savedMap = new Map(saved.map(r => [r.player_name, r.photo_url]));

    // Collect all unique player names from current stats leaders
    const statsPlayers: { name: string; country: string }[] = [];
    if (stats) {
        const seen = new Set<string>();
        for (const cat of stats.categories) {
            for (const l of cat.leaders) {
                if (!seen.has(l.name)) {
                    seen.add(l.name);
                    statsPlayers.push({ name: l.name, country: l.country });
                }
            }
        }
    }

    const filtered = statsPlayers.filter(p =>
        !search || p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Add manually */}
            <div className="card space-y-3">
                <h2 className="font-semibold text-text-primary">📸 Add / Update Player Photo</h2>
                <p className="text-xs text-text-secondary">Player name must match exactly what ESPN returns (check the stats leaderboard).</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                        <label className="label">Player Name (exact)</label>
                        <input className="input" placeholder="e.g. Anthony Gordon" value={newName} onChange={e => setNewName(e.target.value)} />
                    </div>
                    <div>
                        <label className="label">Photo URL</label>
                        <input className="input" placeholder="https://i.imgur.com/..." value={newUrl} onChange={e => setNewUrl(e.target.value)} />
                    </div>
                </div>
                {newUrl && <img src={newUrl} alt="preview" className="h-20 rounded-lg object-cover" onError={e => (e.currentTarget.style.display = 'none')} />}
                <button
                    onClick={() => {
                        if (!newName.trim() || !newUrl.trim()) return;
                        saveMutation.mutate({ name: newName.trim(), url: newUrl.trim() });
                        setNewName(''); setNewUrl('');
                    }}
                    disabled={saveMutation.isPending}
                    className="btn btn-primary"
                >
                    {saveMutation.isPending ? 'Saving…' : 'Save Photo'}
                </button>
                {msg && <p className="text-success text-sm">{msg}</p>}
            </div>

            {/* Current stats leaders */}
            <div className="card space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-text-primary">Current Stats Leaders ({statsPlayers.length} players)</h2>
                    <input
                        className="input text-xs w-40"
                        placeholder="Search…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    {filtered.map(p => {
                        const url = savedMap.get(p.name) ?? null;
                        const isEditing = editingName === p.name;
                        return (
                            <div
                                key={p.name}
                                className="flex items-center gap-3 rounded-xl p-3"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                {/* Photo preview */}
                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    {url ? (
                                        <img src={url} alt={p.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.opacity = '0')} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">?</div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                                    <p className="text-xs text-text-secondary">{p.country}</p>
                                    {isEditing && (
                                        <div className="flex gap-2 mt-2">
                                            <input
                                                className="input text-xs flex-1"
                                                placeholder="Photo URL"
                                                value={draftUrl}
                                                onChange={e => setDraftUrl(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' && draftUrl.trim()) {
                                                        saveMutation.mutate({ name: p.name, url: draftUrl.trim() });
                                                    }
                                                    if (e.key === 'Escape') setEditingName(null);
                                                }}
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => draftUrl.trim() && saveMutation.mutate({ name: p.name, url: draftUrl.trim() })}
                                                className="text-xs px-2 py-1 rounded font-bold"
                                                style={{ background: '#f5b800', color: '#000' }}
                                            >Save</button>
                                            <button onClick={() => setEditingName(null)} className="text-xs px-2 py-1 rounded text-white/40">✕</button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {url ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>✓ set</span>
                                    ) : (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>no photo</span>
                                    )}
                                    <button
                                        onClick={() => { setEditingName(p.name); setDraftUrl(url ?? ''); }}
                                        className="text-xs text-accent hover:underline"
                                    >
                                        {url ? 'Edit' : 'Add'}
                                    </button>
                                    {url && (
                                        <button
                                            onClick={() => deleteMutation.mutate(p.name)}
                                            className="text-xs text-danger hover:underline"
                                        >Del</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* All saved photos */}
            {saved.length > 0 && (
                <div className="card space-y-3">
                    <h2 className="font-semibold text-text-primary">All Saved Photos ({saved.length})</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {saved.map(r => (
                            <div key={r.player_name} className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <img src={r.photo_url} alt={r.player_name} className="w-full h-24 object-cover object-top" onError={e => (e.currentTarget.style.display = 'none')} />
                                <div className="p-2">
                                    <p className="text-xs font-semibold text-white truncate">{r.player_name}</p>
                                    <button onClick={() => deleteMutation.mutate(r.player_name)} className="text-[10px] text-danger hover:underline mt-0.5">Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
