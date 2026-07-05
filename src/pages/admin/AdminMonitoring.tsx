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

function formatDurationSecs(secs: number): string {
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs / 60);
    if (m < 60) return `${m}m ${secs % 60}s`;
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
}

function formatTime(iso: string): string {
    return DateTime.fromISO(iso).setZone('Asia/Kolkata').toFormat('d MMM, h:mm a');
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

function StatusBadge({ status }: { status: number }) {
    const color = status < 300 ? '#22c55e' : status < 400 ? '#f59e0b' : '#ef4444';
    return <span style={{ color, fontWeight: 600, minWidth: 36, display: 'inline-block' }}>{status}</span>;
}

function StatCard({ label, value, sub, accent }: {
    label: string; value: string | number; sub?: string;
    accent?: 'green' | 'yellow' | 'red' | 'blue' | 'purple';
}) {
    const colors: Record<string, string> = {
        green: '#22c55e', yellow: '#f59e0b', red: '#ef4444', blue: '#60a5fa', purple: '#a78bfa',
    };
    return (
        <div className="rounded-xl p-4 flex flex-col gap-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-white/40">{label}</p>
            <p className="text-xl font-bold" style={{ color: accent ? colors[accent] : 'white' }}>{value}</p>
            {sub && <p className="text-xs text-white/30">{sub}</p>}
        </div>
    );
}

function CollapsiblePanel({
    title, badge, defaultOpen = false, children,
}: {
    title: string; badge?: string | number; defaultOpen?: boolean; children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                onClick={() => setOpen((o) => !o)}
            >
                <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold text-white/80">{title}</h2>
                    {badge != null && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full text-white/50"
                            style={{ background: 'rgba(255,255,255,0.08)' }}>
                            {badge}
                        </span>
                    )}
                </div>
                <span className="text-white/30 text-xs">{open ? '▲ collapse' : '▼ expand'}</span>
            </button>
            {open && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    {children}
                </div>
            )}
        </div>
    );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 px-1">{children}</p>;
}

function stageName(s: string): string {
    const m: Record<string, string> = {
        group: 'Group', round32: 'R32', round16: 'R16',
        qf: 'QF', sf: 'SF', third_place: '3rd', final: 'Final',
    };
    return m[s] ?? s;
}

export default function AdminMonitoring() {
    const { data, isLoading, dataUpdatedAt } = useQuery({
        queryKey: ['admin-monitoring'],
        queryFn: () => adminApi.getMonitoring(),
        refetchInterval: 15_000,
    });

    const d = data?.data;
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    if (isLoading) return <div className="text-center py-20 text-white/50">Loading…</div>;

    const funnel = d?.userFunnel;
    const pred   = d?.predictionActivity;
    const stats  = d?.stats;

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">Server Monitoring</h1>
                <span className="text-xs text-white/30">
                    Last refreshed: {dataUpdatedAt ? formatTime(new Date(dataUpdatedAt).toISOString()) : '—'}
                    {' · '}auto-refreshes every 15s
                </span>
            </div>

            {/* ── User Engagement ─────────────────────────────────────────── */}
            <div>
                <GroupLabel>User Engagement</GroupLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard label="Total Users" value={funnel?.totalUsers ?? '—'} accent="blue" />
                    <StatCard
                        label="Active Today (DAU)"
                        value={funnel?.dau ?? '—'}
                        sub={funnel?.totalUsers ? `${Math.round((funnel.dau / funnel.totalUsers) * 100)}% of users` : undefined}
                        accent="green"
                    />
                    <StatCard
                        label="Active 7 Days (WAU)"
                        value={funnel?.wau ?? '—'}
                        sub={funnel?.totalUsers ? `${Math.round((funnel.wau / funnel.totalUsers) * 100)}% of users` : undefined}
                        accent="green"
                    />
                    <StatCard
                        label="Never Predicted"
                        value={funnel?.neverPredicted ?? '—'}
                        sub="non-admin, no prediction yet"
                        accent={(funnel?.neverPredicted ?? 0) > 0 ? 'yellow' : 'green'}
                    />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <StatCard label="Joined Today"     value={funnel?.joinedToday    ?? '—'} accent="purple" />
                    <StatCard label="Joined This Week" value={funnel?.joinedThisWeek ?? '—'} accent="purple" />
                    <StatCard label="Logged In Today"  value={funnel?.loggedInToday  ?? '—'} accent="blue"   />
                    <StatCard label="Logged In 7 Days" value={funnel?.loggedIn7d     ?? '—'} accent="blue"   />
                </div>
            </div>

            {/* ── Inactive Users ──────────────────────────────────────────── */}
            {(d?.inactiveUsers ?? []).length > 0 && (
                <div>
                    <GroupLabel>
                        Inactive Users — not seen in 7+ days&nbsp;
                        <span className="text-yellow-400/70">({(d?.inactiveUsers ?? []).length})</span>
                    </GroupLabel>
                    <div className="rounded-xl overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,179,0,0.15)' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        {['Username', 'Joined', 'Last Seen', 'Last Login', 'Total Requests'].map((h) => (
                                            <th key={h} className="px-4 py-2 text-left text-white/40 font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(d?.inactiveUsers ?? []).map((u: any) => (
                                        <tr key={u.username} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td className="px-4 py-2 text-white/80 font-medium">{u.username}</td>
                                            <td className="px-4 py-2 text-white/40">{formatTime(u.joinedAt)}</td>
                                            <td className="px-4 py-2">
                                                {u.lastSeen
                                                    ? <span className="text-yellow-400/80">{timeAgo(u.lastSeen)}</span>
                                                    : <span className="text-red-400/70">never visited</span>}
                                            </td>
                                            <td className="px-4 py-2 text-white/40">
                                                {u.lastLogin ? timeAgo(u.lastLogin) : <span className="text-white/20">—</span>}
                                            </td>
                                            <td className="px-4 py-2 text-white/50">{u.totalRequests}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Prediction Activity ─────────────────────────────────────── */}
            <div>
                <GroupLabel>Prediction Activity</GroupLabel>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <StatCard label="All-Time Predictions" value={pred?.total ?? '—'} accent="blue" />
                    <StatCard label="Made Today"           value={pred?.today ?? '—'} accent="green" />
                    <StatCard label="Made This Week"       value={pred?.thisWeek ?? '—'} accent="green" />
                    <StatCard
                        label="Users Who Predicted"
                        value={pred?.uniquePredictors ?? '—'}
                        sub={funnel?.totalUsers ? `${Math.round(((pred?.uniquePredictors ?? 0) / funnel.totalUsers) * 100)}% activation` : undefined}
                        accent="yellow"
                    />
                    <StatCard label="Avg Predictions / User" value={pred?.avgPerUser ?? '—'} accent="purple" />
                </div>
            </div>

            {/* ── Upcoming Match Coverage ─────────────────────────────────── */}
            {(d?.upcomingCoverage ?? []).length > 0 && (
                <div className="rounded-xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <h2 className="text-sm font-semibold text-white/80">Upcoming Match Coverage — open for predictions</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    {['#', 'Match', 'Stage', 'Kickoff (IST)', 'Predictions', 'Coverage'].map((h) => (
                                        <th key={h} className="px-4 py-2 text-left text-white/40 font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(d?.upcomingCoverage ?? []).map((c: any) => {
                                    const pct = c.coverage_pct;
                                    const barColor = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';
                                    return (
                                        <tr key={c.fixture_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td className="px-4 py-2 text-white/40">{c.match_number}</td>
                                            <td className="px-4 py-2 text-white/80 font-medium whitespace-nowrap">
                                                {c.home_team} <span className="text-white/30">vs</span> {c.away_team}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className="px-2 py-0.5 rounded text-white/60 text-[11px]"
                                                    style={{ background: 'rgba(255,255,255,0.08)' }}>
                                                    {stageName(c.stage)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-white/50 whitespace-nowrap">{formatTime(c.kickoff_time)}</td>
                                            <td className="px-4 py-2 text-white/70 font-semibold">{c.predicted_count}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 h-1.5 rounded-full overflow-hidden"
                                                        style={{ background: 'rgba(255,255,255,0.10)' }}>
                                                        <div className="h-full rounded-full"
                                                            style={{ width: `${pct}%`, background: barColor }} />
                                                    </div>
                                                    <span style={{ color: barColor, fontWeight: 600 }}>{pct}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Server Health ────────────────────────────────────────────── */}
            <div>
                <GroupLabel>Server Health (last 24h)</GroupLabel>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <StatCard label="Uptime"        value={d?.uptimeMs != null ? formatDuration(d.uptimeMs) : '—'} accent="green" />
                    <StatCard label="Started At"    value={d?.startedAt ? formatTime(d.startedAt) : '—'} />
                    <StatCard label="Requests"      value={stats?.total24h ?? '—'} accent="blue" />
                    <StatCard
                        label="Errors"
                        value={`${stats?.errors24h ?? 0} (${stats?.errorRate ?? 0}%)`}
                        accent={(stats?.errorRate ?? 0) > 5 ? 'red' : (stats?.errorRate ?? 0) > 0 ? 'yellow' : 'green'}
                    />
                    <StatCard
                        label="Avg / p95 Latency"
                        value={stats ? `${stats.avgDurationMs}ms` : '—'}
                        sub={stats ? `p95: ${stats.p95DurationMs}ms` : undefined}
                        accent={(stats?.p95DurationMs ?? 0) > 1000 ? 'red' : (stats?.p95DurationMs ?? 0) > 500 ? 'yellow' : 'green'}
                    />
                </div>
            </div>

            {/* ── User Activity (collapsible, default closed) ─────────────── */}
            <CollapsiblePanel
                title="User Activity"
                badge={`${(d?.userActivity ?? []).length} active in last 24h`}
            >
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
                                        {u.role === 'admin' && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                                                admin
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-white/40">
                                        <span><span className="text-white/70 font-medium">{u.totalRequests}</span> req</span>
                                        <span><span className="text-white/70 font-medium">{u.uniquePaths}</span> paths</span>
                                        <span>last seen <span className="text-green-400/80 font-medium">{timeAgo(u.lastSeen)}</span></span>
                                        <span className="text-white/30">{selectedUser === u.username ? '▲' : '▼'}</span>
                                    </div>
                                </button>
                                {selectedUser === u.username && (
                                    <div className="px-4 pb-4 pt-2 space-y-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        {/* Stats row */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            <div className="rounded-lg p-3 text-center"
                                                style={{ background: 'rgba(255,255,255,0.04)' }}>
                                                <p className="text-[11px] text-white/30 mb-0.5">Last Visited</p>
                                                <p className="text-sm font-semibold text-green-400">{timeAgo(u.lastSeen)}</p>
                                                <p className="text-[10px] text-white/20">{formatTime(u.lastSeen)}</p>
                                            </div>
                                            <div className="rounded-lg p-3 text-center"
                                                style={{ background: 'rgba(255,255,255,0.04)' }}>
                                                <p className="text-[11px] text-white/30 mb-0.5">Requests (24h)</p>
                                                <p className="text-sm font-semibold text-blue-400">{u.totalRequests}</p>
                                                <p className="text-[10px] text-white/20">across {u.uniquePaths} endpoints</p>
                                            </div>
                                            <div className="rounded-lg p-3 text-center"
                                                style={{ background: 'rgba(255,255,255,0.04)' }}>
                                                <p className="text-[11px] text-white/30 mb-0.5">Session Span</p>
                                                <p className="text-sm font-semibold text-purple-400">
                                                    {u.sessionSpanSeconds > 0
                                                        ? formatDurationSecs(u.sessionSpanSeconds)
                                                        : '< 1m'}
                                                </p>
                                                <p className="text-[10px] text-white/20">first → last req</p>
                                            </div>
                                            <div className="rounded-lg p-3 text-center"
                                                style={{ background: 'rgba(255,255,255,0.04)' }}>
                                                <p className="text-[11px] text-white/30 mb-0.5">Member Since</p>
                                                <p className="text-sm font-semibold text-white/60">
                                                    {u.firstEverSeen ? timeAgo(u.firstEverSeen) : '—'}
                                                </p>
                                                <p className="text-[10px] text-white/20">first request ever</p>
                                            </div>
                                        </div>
                                        {/* Top paths */}
                                        <div>
                                            <p className="text-[11px] text-white/30 mb-2 font-medium uppercase tracking-wider">
                                                What they did (top endpoints)
                                            </p>
                                            <div className="space-y-1">
                                                {u.topPaths.map((p: any, i: number) => {
                                                    const maxCount = u.topPaths[0]?.count ?? 1;
                                                    const pct = Math.round((p.count / maxCount) * 100);
                                                    return (
                                                        <div key={p.path} className="flex items-center gap-2">
                                                            <span className="text-[10px] text-white/30 w-4">{i + 1}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-0.5">
                                                                    <span className="text-xs font-mono text-white/70 truncate">{p.path}</span>
                                                                    <span className="text-xs text-white/40 ml-2 flex-shrink-0">×{p.count}</span>
                                                                </div>
                                                                <div className="h-1 rounded-full overflow-hidden"
                                                                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                                                                    <div className="h-full rounded-full"
                                                                        style={{ width: `${pct}%`, background: 'rgba(96,165,250,0.5)' }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {/* Time range */}
                                        <div className="flex gap-4 text-[11px] text-white/30 pt-1 border-t"
                                            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                            <span>First seen today: <span className="text-white/50">{formatTime(u.firstSeen24h)}</span></span>
                                            <span>Last seen: <span className="text-white/50">{formatTime(u.lastSeen)}</span></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CollapsiblePanel>

            {/* ── Top Endpoints (collapsible, default closed) ─────────────── */}
            {(d?.topEndpoints ?? []).length > 0 && (
                <CollapsiblePanel title="Top Endpoints" badge="last 24h">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    {['Method', 'Path', 'Requests', 'Avg ms', 'Max ms', 'Errors'].map((h) => (
                                        <th key={h} className="px-4 py-2 text-left text-white/40 font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(d?.topEndpoints ?? []).map((e: any, i: number) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td className="px-4 py-1.5 font-mono font-semibold text-yellow-400/80">{e.method}</td>
                                        <td className="px-4 py-1.5 text-white/70 font-mono">{e.path}</td>
                                        <td className="px-4 py-1.5 text-white/80 font-semibold">{e.count}</td>
                                        <td className="px-4 py-1.5 text-white/50">{e.avgMs}ms</td>
                                        <td className="px-4 py-1.5 text-white/40">{e.maxMs}ms</td>
                                        <td className="px-4 py-1.5">
                                            {e.errors > 0
                                                ? <span className="text-red-400 font-semibold">{e.errors}</span>
                                                : <span className="text-white/20">—</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CollapsiblePanel>
            )}

            {/* ── Recent Requests (collapsible, default closed) ───────────── */}
            <CollapsiblePanel title="Recent Requests" badge="last 24h · 100 entries">
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
                                    <td className="px-4 py-1.5 font-mono text-yellow-400/80">{r.method}</td>
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
                            {(d?.recentRequests ?? []).length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-3 text-white/30">No requests logged yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CollapsiblePanel>

            {/* ── Restart History (collapsible, default closed) ───────────── */}
            <CollapsiblePanel title="Restart History" badge={`${(d?.history ?? []).length} events`}>
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
                            <div className="text-xs">
                                {h.ranForMs == null ? (
                                    <span className="text-green-400">▲ running for {d?.uptimeMs != null ? formatDuration(d.uptimeMs) : '…'}</span>
                                ) : (
                                    <span className="text-white/40">
                                        ran {formatDuration(h.ranForMs)} · <span className="text-red-400">restarted</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CollapsiblePanel>

        </div>
    );
}
