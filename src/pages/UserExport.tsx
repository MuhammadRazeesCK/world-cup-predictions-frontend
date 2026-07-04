import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toPng } from 'html-to-image';
import { predictionsApi } from '../api/predictions';
import { leaderboardApi } from '../api/leaderboard';
import { Header } from '../components/Header';
import { Button } from '../components/common/Button';
import {
    CARD_W, PREVIEW_SCALE,
    ScaledPreview, PredictionsCard, StandingsCard, PredictedWinnersCard,
    stageName, getFlag,
    type FixtureGroup,
} from '../components/export/ExportComponents';
import type { LeaderboardEntry } from '../types';

function slug(s: string) { return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }

const sectionTabs = [
    { key: 'match' as const, label: 'Match Predictions' },
    { key: 'standings' as const, label: 'Standings' },
    { key: 'winners' as const, label: 'Predicted Winners' },
];

export function UserExport() {
    const [section, setSection] = useState<'match' | 'standings' | 'winners'>('match');
    const [selectedId, setSelectedId] = useState<string>('');
    const [exporting, setExporting] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    const predsRef = useRef<HTMLDivElement>(null!);
    const predictedWinnersRef = useRef<HTMLDivElement>(null!);
    const standRef = useRef<HTMLDivElement>(null!);

    const { data: lockedRes, isLoading: loadingLocked } = useQuery({
        queryKey: ['lockedFixtures'],
        queryFn: predictionsApi.getLockedFixtures,
        staleTime: 60_000,
    });

    const { data: lbRes, isLoading: loadingLb } = useQuery({
        queryKey: ['leaderboard', 'all'],
        queryFn: () => leaderboardApi.getLeaderboard({ limit: 100 }),
        staleTime: 60_000,
        enabled: section === 'standings',
    });

    const groups: FixtureGroup[] = lockedRes?.data ?? [];
    const entries: LeaderboardEntry[] = (lbRes?.data as any)?.entries ?? (lbRes?.data as any)?.leaderboard ?? [];

    const selectedGroup = groups.find((g) => g.fixture.id === selectedId) ?? null;

    const dl = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
        if (!ref.current) return;
        setExporting(true);
        try {
            const dataUrl = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
            const a = document.createElement('a');
            a.href = dataUrl; a.download = filename; a.click();
        } catch (e) { console.error(e); }
        finally { setExporting(false); }
    };

    const shareWA = async (ref: React.RefObject<HTMLDivElement>) => {
        if (!ref.current) return;
        setSharing(true);
        try {
            const dataUrl = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setCopied(true); setTimeout(() => setCopied(false), 5000);
        } catch (e: any) { if (e?.name !== 'AbortError') console.error(e); }
        finally { setSharing(false); }
    };

    const WABtn = ({ divRef }: { divRef: React.RefObject<HTMLDivElement> }) => (
        <button
            disabled={sharing}
            onClick={() => shareWA(divRef)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-opacity disabled:opacity-40"
            style={{ background: 'rgba(37,211,102,0.12)', color: '#25d366', border: '1px solid rgba(37,211,102,0.3)' }}
        >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {sharing ? 'Sharing…' : 'Share to WhatsApp'}
        </button>
    );

    const PreviewCard = ({ children, divRef, filename, matchNumber, homeTeam, awayTeam }: {
        children: React.ReactNode;
        divRef: React.RefObject<HTMLDivElement>;
        filename: string;
        matchNumber?: number;
        homeTeam?: string;
        awayTeam?: string;
    }) => (
        <div className="space-y-4">
            <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
                <ScaledPreview scale={PREVIEW_SCALE} width={CARD_W}>{children}</ScaledPreview>
            </div>
            {copied && (
                <div
                    className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
                    style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366' }}
                >
                    📋 Image copied! Switch to WhatsApp Web and paste (⌘V / Ctrl+V)
                </div>
            )}
            <div className="flex gap-2">
                <Button isLoading={exporting} onClick={() => dl(divRef, filename)}>⬇ Download PNG</Button>
                <WABtn divRef={divRef} />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pb-20 sm:pb-8" style={{ background: '#0a0a0a' }}>
            <Header />
            <main className="max-w-2xl mx-auto px-4 py-5">

                {/* Page title */}
                <div className="mb-5">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'rgba(245,184,0,0.7)' }}>
                        FIFA World Cup 2026
                    </div>
                    <h1 className="font-black text-white" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2rem', letterSpacing: '0.04em' }}>
                        Export &amp; Share
                    </h1>
                </div>

                {/* Section tabs */}
                <div className="flex items-center gap-2 mb-5">
                    {sectionTabs.map((tab) => {
                        const active = section === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setSection(tab.key)}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                                style={active
                                    ? { background: '#f5b800', color: '#0a0a0a' }
                                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Match Predictions ─────────────────────────────── */}
                {section === 'match' && (
                    <div className="space-y-4">
                        <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            All players' predictions for a locked knockout match.
                        </p>

                        {loadingLocked ? (
                            <div className="text-xs font-bold uppercase tracking-widest py-8 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>Loading…</div>
                        ) : groups.length === 0 ? (
                            <div
                                className="rounded-xl text-center py-10 px-6"
                                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Nothing yet</div>
                                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>No locked knockout matches yet</p>
                            </div>
                        ) : (
                            <>
                                <select
                                    className="w-full rounded-lg px-3 py-2 text-sm font-medium"
                                    style={{ background: '#111111', color: '#eef2ff', border: '1px solid rgba(255,255,255,0.1)' }}
                                    value={selectedId}
                                    onChange={(e) => setSelectedId(e.target.value)}
                                >
                                    <option value="">— Select a match —</option>
                                    {groups.map((g) => (
                                        <option key={g.fixture.id} value={g.fixture.id}>
                                            M{g.fixture.match_number} · {getFlag(g.fixture.home_team)} {g.fixture.home_team} vs {g.fixture.away_team} {getFlag(g.fixture.away_team)} · {stageName(g.fixture.stage)}
                                        </option>
                                    ))}
                                </select>
                                {selectedGroup && (
                                    <PreviewCard
                                        divRef={predsRef}
                                        filename={`wc2026-m${selectedGroup.fixture.match_number}-${slug(selectedGroup.fixture.home_team)}-vs-${slug(selectedGroup.fixture.away_team)}-predictions.png`}
                                    >
                                        <PredictionsCard cardRef={predsRef} group={selectedGroup} />
                                    </PreviewCard>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ── Standings ─────────────────────────────────────── */}
                {section === 'standings' && (
                    <div className="space-y-4">
                        <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Current overall leaderboard.
                        </p>

                        {loadingLb ? (
                            <div className="text-xs font-bold uppercase tracking-widest py-8 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>Loading…</div>
                        ) : entries.length === 0 ? (
                            <div
                                className="rounded-xl text-center py-10 px-6"
                                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>No leaderboard data yet</p>
                            </div>
                        ) : (
                            <PreviewCard divRef={standRef} filename="wc2026-standings.png">
                                <StandingsCard cardRef={standRef} entries={entries} scope="all" />
                            </PreviewCard>
                        )}
                    </div>
                )}

                {/* ── Predicted Winners ─────────────────────────────── */}
                {section === 'winners' && (
                    <div className="space-y-4">
                        <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Who each player is backing — visible once predictions are locked.
                        </p>

                        {loadingLocked ? (
                            <div className="text-xs font-bold uppercase tracking-widest py-8 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>Loading…</div>
                        ) : groups.length === 0 ? (
                            <div
                                className="rounded-xl text-center py-10 px-6"
                                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Nothing yet</div>
                                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>No locked knockout matches yet</p>
                            </div>
                        ) : (
                            <>
                                <select
                                    className="w-full rounded-lg px-3 py-2 text-sm font-medium"
                                    style={{ background: '#111111', color: '#eef2ff', border: '1px solid rgba(255,255,255,0.1)' }}
                                    value={selectedId}
                                    onChange={(e) => setSelectedId(e.target.value)}
                                >
                                    <option value="">— Select a match —</option>
                                    {groups.map((g) => (
                                        <option key={g.fixture.id} value={g.fixture.id}>
                                            M{g.fixture.match_number} · {getFlag(g.fixture.home_team)} {g.fixture.home_team} vs {g.fixture.away_team} {getFlag(g.fixture.away_team)} · {stageName(g.fixture.stage)}
                                        </option>
                                    ))}
                                </select>
                                {selectedGroup && (
                                    <PreviewCard
                                        divRef={predictedWinnersRef}
                                        filename={`wc2026-m${selectedGroup.fixture.match_number}-${slug(selectedGroup.fixture.home_team)}-vs-${slug(selectedGroup.fixture.away_team)}-predicted-winners.png`}
                                    >
                                        <PredictedWinnersCard cardRef={predictedWinnersRef} group={selectedGroup} />
                                    </PreviewCard>
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
