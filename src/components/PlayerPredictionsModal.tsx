import { useQuery } from '@tanstack/react-query';
import { Modal } from './common/Modal';
import { predictionsApi } from '../api/predictions';
import { PredictionHistoryItem } from '../types';
import { formatKickoffIST, formatStageName } from '../utils/timezone';

const resultConfig: Record<string, { borderColor: string; label: string; labelBg: string; labelColor: string; ptColor: string }> = {
  exact:  { borderColor: '#16a34a', label: 'Exact Score',    labelBg: 'rgba(22,163,74,0.12)',  labelColor: '#4ade80', ptColor: '#f5b800' },
  winner: { borderColor: '#3b82f6', label: 'Correct Winner', labelBg: 'rgba(59,130,246,0.12)', labelColor: '#60a5fa', ptColor: '#f5b800' },
  wrong:  { borderColor: '#ef4444', label: 'Wrong',          labelBg: 'rgba(239,68,68,0.1)',   labelColor: '#f87171', ptColor: 'rgba(255,255,255,0.3)' },
};

function MiniPredCard({ item }: { item: PredictionHistoryItem }) {
  const rt = item.result.result_type || 'wrong';
  const cfg = resultConfig[rt] ?? resultConfig.wrong;
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `3px solid ${cfg.borderColor}` }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
            {formatStageName(item.fixture.stage)}
          </span>
          <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            #{item.fixture.match_number} · {formatKickoffIST(item.fixture.kickoff_time)}
          </span>
        </div>
        <div className="font-black text-sm uppercase tracking-wide mb-2.5" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {item.fixture.home_team} <span style={{ color: 'rgba(255,255,255,0.2)' }}>vs</span> {item.fixture.away_team}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Pick</div>
              <div className="font-black tabular-nums" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', lineHeight: 1, color: 'rgba(255,255,255,0.55)' }}>
                {item.prediction.predicted_home_goals} – {item.prediction.predicted_away_goals}
              </div>
            </div>
            {item.result.home_goals !== undefined && (
              <>
                <span className="font-black" style={{ color: 'rgba(255,255,255,0.15)' }}>→</span>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Result</div>
                  <div className="font-black tabular-nums" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', lineHeight: 1, color: 'rgba(255,255,255,0.9)' }}>
                    {item.result.home_goals} – {item.result.away_goals}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black px-2 py-1 rounded-lg inline-block mb-1 uppercase tracking-widest" style={{ background: cfg.labelBg, color: cfg.labelColor }}>
              {cfg.label}
            </span>
            <div className="font-black" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.2rem', lineHeight: 1, color: cfg.ptColor }}>
              {item.result.points ?? 0}<span className="text-xs font-bold ml-0.5" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'inherit' }}>pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

export function PlayerPredictionsModal({ username, onClose }: { username: string; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['predictions', 'user', username],
    queryFn: () => predictionsApi.getUserHistory(username).then((r) => r.data),
    staleTime: 60_000,
  });
  return (
    <Modal isOpen onClose={onClose} title={`@${username}'s Predictions`} size="md">
      {isLoading && (
        <div className="flex justify-center py-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
          </svg>
        </div>
      )}
      {!isLoading && data?.predictions.length === 0 && (
        <p className="text-center text-sm py-8" style={{ color: 'rgba(255,255,255,0.35)' }}>No completed predictions yet.</p>
      )}
      {!isLoading && data && data.predictions.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>{data.total} completed predictions</div>
          {data.predictions.map(item => <MiniPredCard key={item.id} item={item} />)}
        </div>
      )}
    </Modal>
  );
}
