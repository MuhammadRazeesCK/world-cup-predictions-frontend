import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { usePredictionHistory } from '../hooks/usePredictions';
import { PredictionHistoryItem } from '../types';
import { formatKickoffIST, formatStageName } from '../utils/timezone';

const filterTabs = [
  { key: '', label: 'All' },
  { key: 'exact,winner', label: 'Correct' },
  { key: 'wrong', label: 'Wrong' },
];

const resultConfig: Record<string, { borderColor: string; label: string; labelBg: string; labelColor: string; ptColor: string }> = {
  exact:   { borderColor: '#16a34a', label: 'EXACT SCORE', labelBg: 'rgba(22,163,74,0.15)',  labelColor: '#4ade80', ptColor: '#f5b800' },
  winner:  { borderColor: '#3b82f6', label: 'CORRECT WINNER', labelBg: 'rgba(59,130,246,0.15)', labelColor: '#60a5fa', ptColor: '#f5b800' },
  wrong:   { borderColor: '#dc2626', label: 'WRONG',       labelBg: 'rgba(220,38,38,0.15)',  labelColor: '#f87171', ptColor: '#6b89b4' },
  pending: { borderColor: '#3d5a80', label: 'PENDING',      labelBg: 'rgba(61,90,128,0.15)',  labelColor: '#6b89b4', ptColor: '#6b89b4' },
};

function PredictionCard({ item }: { item: PredictionHistoryItem }) {
  const rt = item.result.result_type || 'pending';
  const cfg = resultConfig[rt] || resultConfig.pending;

  return (
    <div className="rounded-xl overflow-hidden" style={{
      background: '#071428',
      border: `1px solid rgba(26,58,107,0.8)`,
      borderLeft: `4px solid ${cfg.borderColor}`,
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    }}>
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ background: 'rgba(26,58,107,0.6)', color: '#6b89b4' }}>
                {formatStageName(item.fixture.stage)}
              </span>
              <span className="text-[10px]" style={{ color: '#3d5a80' }}>#{item.fixture.match_number} · {formatKickoffIST(item.fixture.kickoff_time)}</span>
            </div>
            <div className="font-black text-sm text-text-primary uppercase tracking-wide truncate">
              {item.fixture.home_team} vs {item.fixture.away_team}
            </div>

            {/* Score comparison */}
            <div className="flex items-center gap-4 mt-2">
              <div>
                <div className="text-[10px] font-bold uppercase" style={{ color: '#3d5a80' }}>Your Pick</div>
                <div className="font-black text-lg tabular-nums" style={{ color: '#6b89b4' }}>
                  {item.prediction.predicted_home_goals} – {item.prediction.predicted_away_goals}
                </div>
              </div>
              {item.fixture.status === 'completed' && item.result.home_goals !== undefined && (
                <>
                  <div style={{ color: '#3d5a80', fontSize: '1.2rem', fontWeight: 900 }}>→</div>
                  <div>
                    <div className="text-[10px] font-bold uppercase" style={{ color: '#3d5a80' }}>Result</div>
                    <div className="font-black text-lg tabular-nums" style={{ color: '#eef2ff' }}>
                      {item.result.home_goals} – {item.result.away_goals}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Result badge + points */}
          <div className="text-right flex-shrink-0">
            <span className="text-[10px] font-black px-2 py-1 rounded block mb-1" style={{ background: cfg.labelBg, color: cfg.labelColor }}>
              {cfg.label}
            </span>
            {item.fixture.status === 'completed' && (
              <div className="font-black text-xl" style={{ color: cfg.ptColor }}>{item.result.points ?? 0}<span className="text-xs font-bold ml-0.5" style={{ color: '#3d5a80' }}>pts</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PredictionHistory() {
  const [activeFilter, setActiveFilter] = useState('');
  const { data, isLoading, error } = usePredictionHistory({ result: activeFilter || undefined, limit: 50 });

  return (
    <div className="min-h-screen pb-20 sm:pb-8">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-5">
        <div className="mb-5">
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f5b800' }}>World Cup 2026</div>
          <h1 className="font-black text-2xl text-text-primary">My Predictions</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {filterTabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all"
              style={activeFilter === tab.key
                ? { background: '#f5b800', color: '#020c1f' }
                : { background: 'rgba(13,31,60,0.8)', color: '#6b89b4', border: '1px solid rgba(26,58,107,0.8)' }}>
              {tab.label}
            </button>
          ))}
          {data && <span className="ml-auto text-xs self-center" style={{ color: '#3d5a80' }}>{data.total} predictions</span>}
        </div>

        {isLoading && <div className="text-center py-12"><div className="text-4xl animate-pulse">⚽</div></div>}
        {error && <div className="text-center py-6 text-xs font-bold uppercase" style={{ color: '#dc2626' }}>Failed to load</div>}
        {!isLoading && data?.predictions.length === 0 && (
          <div className="card text-center py-10">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm" style={{ color: '#6b89b4' }}>No predictions yet</p>
          </div>
        )}

        <div className="space-y-3">
          {data?.predictions.map(item => <PredictionCard key={item.id} item={item} />)}
        </div>
      </main>
      <Footer />
    </div>
  );
}
