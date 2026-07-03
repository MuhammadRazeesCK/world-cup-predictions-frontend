import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '../../api/admin';
import { DateTime } from 'luxon';

function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ${s % 60}s`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ${m % 60}m`;
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
}

function formatTime(iso: string): string {
    return DateTime.fromISO(iso).setZone('Asia/Kolkata').toFormat('d MMM, h:mm:ss a');
}

function StatusBadge({ status }: { status: number }) {
    const color =
        status < 300 ? '#22c55e' :
        status < 400 ? '#f59e0b' :
        '#ef4444';
    return (
        <span style={{ color, fontWeight: 600, minWidth: 36, display: 'inline-block' }}>{status}</span>
    );
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return formatTime(iso);
}

export default function AdminMonitoring() {
    const { data, isLoading, dataUpdatedAt } = useQuery({
        queryKey: ['admin-monitoring'],
        queryFn: () => adminApi.getMonitoring(),
        refetchInterval: 15_000,
    });

    const d = data?.data;
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    if (isLoading) {
        return <div className="text-center py-20 text-white/50">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">Server Monitoring</h1>
                <span className="text-xs text-white/30">
                    Last refreshed: {dataUpdatedAt ? formatTime(new Date(dataUpdatedAt).toISOString()) : '—'}
                    {' · '}auto-refreshes every 15s
                </span>
            </div>

            {/* Uptime card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Current Uptime', value: d?.uptimeMs != null ? formatDuration(d.uptimeMs) : '—' },
                    { label: 'Started At', value: d?.startedAt ? formatTime(d.startedAt) : '—' },
                    { label: 'Req (last 24h)', value: d?.stats?.total24h ?? '—' },
                    { label: 'Error Rate', value: d?.stats ? `${d.stats.errors24h} errors (${d.stats.errorRate}%)` : '—' },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p className="text-xs text-white/40 mb-1">{stat.label}</p>
                        <p className="text-base font-semibold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Restart history */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <h2 className="text-sm font-semibold text-white/80">Restart History</h2>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    {(d?.history ?? []).length === 0 && (
                        <p className="px-4 py-3 text-sm text-white/30">No data yet</p>
                    )}
                    {(d?.history ?? []).map((h: any, i: number) => (
                        <div key={i} className="px-4 py-2.5 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                <span className="text-white/80">{formatTime(h.startedAt)}</span>
                                <span className="text-xs text-white/30">{h.metadata?.env ?? ''}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                {h.ranForMs == null ? (
                                    <span className="text-green-400">▲ running for {d?.uptimeMs != null ? formatDuration(d.uptimeMs) : '…'}</span>
                                ) : (
                                    <>
                                        <span className="text-white/40">ran for {formatDuration(h.ranForMs)}</span>
                                        <span className="text-red-400">↓ restarted</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent requests */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <h2 className="text-sm font-semibold text-white/80">Recent Requests</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {['Time', 'Method', 'Path', 'Status', 'Duration', 'User', 'IP'].map((h) => (
                                    <th key={h} className="px-4 py-2 text-left text-white/40 font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(d?.recentRequests ?? []).map((r: any, i: number) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td className="px-4 py-1.5 text-white/40 whitespace-nowrap">{formatTime(r.timestamp)}</td>
                                    <td className="px-4 py-1.5">
                                        <span className="font-mono text-yellow-400/80">{r.method}</span>
                                    </td>
                                    <td className="px-4 py-1.5 text-white/70 font-mono truncate max-w-xs">{r.path}</td>
                                    <td className="px-4 py-1.5"><StatusBadge status={r.status} /></td>
                                    <td className="px-4 py-1.5 text-white/50">{r.duration}ms</td>
                                    <td className="px-4 py-1.5">
                                        {r.username
                                            ? <span className={r.role === 'admin' ? 'text-yellow-400' : 'text-white/70'}>{r.username}</span>
                                            : <span className="text-white/20">—</span>}
                                    </td>
                                    <td className="px-4 py-1.5 text-white/30 font-mono">{r.ip}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(d?.recentRequests ?? []).length === 0 && (
                        <p className="px-4 py-3 text-sm text-white/30">No requests logged yet</p>
                    )}
                </div>
            </div>

            {/* User Activity */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <h2 className="text-sm font-semibold text-white/80">User Activity <span className="text-white/30 font-normal">(last 24h)</span></h2>
                </div>
                {(d?.userActivity ?? []).length === 0 ? (
                    <p className="px-4 py-3 text-sm text-white/30">No authenticated activity yet</p>
                ) : (
                    <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        {(d?.userActivity ?? []).map((u: any) => (
                            <div key={u.username}>
                                <button
                                    className="w-full px-4 py-3 flex items-center justify-between text-sm hover:bg-white/5 transition-colors"
                                    onClick={() => setSelectedUser(selectedUser === u.username ? null : u.username)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={u.role === 'admin' ? 'text-yellow-400 font-semibold' : 'text-white/80 font-medium'}>
                                            {u.username}
                                        </span>
                                        {u.role === 'admin' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">admin</span>}
                                    </div>
                                    <div className="flex items-center gap-6 text-xs text-white/40">
                                        <span><span className="text-white/70 font-medium">{u.totalRequests}</span> requests</span>
                                        <span><span className="text-white/70 font-medium">{u.uniquePaths}</span> paths</span>
                                        <span>last seen <span className="text-white/70">{timeAgo(u.lastSeen)}</span></span>
                                        <span>first ever <span className="text-white/70">{u.firstEverSeen ? formatTime(u.firstEverSeen) : '—'}</span></span>
                                        <span className="text-white/30">{selectedUser === u.username ? '▲' : '▼'}</span>
                                    </div>
                                </button>
                                {selectedUser === u.username && (
                                    <div className="px-4 pb-3 pt-1" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <p className="text-xs text-white/30 mb-2">Top paths visited (24h)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {u.topPaths.map((p: any) => (
                                                <span key={p.path} className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
                                                    {p.path} <span className="text-white/30">×{p.count}</span>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-2 flex gap-6 text-xs text-white/30">
                                            <span>First seen today: <span className="text-white/50">{formatTime(u.firstSeen24h)}</span></span>
                                            <span>Last seen: <span className="text-white/50">{formatTime(u.lastSeen)}</span></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
