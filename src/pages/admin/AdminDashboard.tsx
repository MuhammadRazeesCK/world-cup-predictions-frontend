import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Header } from '../../components/Header';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { adminApi } from '../../api/admin';
import { Fixture } from '../../types';
import { formatKickoffIST, formatStageName } from '../../utils/timezone';
import { SORTED_TEAMS, TeamFlag } from '../../utils/teams';
import { ExportTab } from '../../components/export/ExportTab';
import { PendingReminderExport } from '../../components/export/PendingReminderCard';

// Common timezone offsets for WC 2026 host cities + India
const TIMEZONES = [
  { label: 'IST – India (UTC+5:30)',          value: '+05:30' },
  { label: 'EST – New York / USA East (UTC-5)', value: '-05:00' },
  { label: 'CST – Chicago / USA Central (UTC-6)', value: '-06:00' },
  { label: 'MST – Denver / USA Mountain (UTC-7)', value: '-07:00' },
  { label: 'PST – Los Angeles / USA West (UTC-8)', value: '-08:00' },
  { label: 'EDT – New York Daylight (UTC-4)',    value: '-04:00' },
  { label: 'CDT – Chicago Daylight (UTC-5)',     value: '-05:00' },
  { label: 'MDT – Denver Daylight (UTC-6)',      value: '-06:00' },
  { label: 'PDT – LA Daylight (UTC-7)',          value: '-07:00' },
  { label: 'GMT – London (UTC+0)',               value: '+00:00' },
  { label: 'CET – Europe (UTC+1)',               value: '+01:00' },
];

/** Converts a datetime-local string + tz offset into ISO 8601 with offset */
function toISO(datetimeLocal: string, offset: string): string {
  if (!datetimeLocal) return '';
  return `${datetimeLocal}:00${offset}`;
}

const STAGES = ['group', 'round32', 'round16', 'qf', 'sf', 'third_place', 'final'];

interface FixtureForm {
  match_number: number;
  home_team: string;
  away_team: string;
  kickoff_date: string;
  kickoff_tz: string;
  stage: string;
  penalty_enabled: boolean;
}

function UploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<{ uploaded: number; total: number; errors: string[] } | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => adminApi.bulkUpload(file).then((r) => r.data),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['admin', 'fixtures'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Upload failed');
    },
  });

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a .csv file');
      return;
    }
    setError('');
    setResult(null);
    uploadMutation.mutate(file);
  };

  return (
    <div className="card space-y-4">
      <h2 className="font-semibold text-text-primary">📤 Bulk Upload Fixtures (CSV)</h2>

      <div className="text-text-secondary text-xs">
        CSV format: <code className="bg-slate-800 px-1 rounded">match_number,home_team,away_team,kickoff_time,stage</code>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging ? 'border-accent bg-accent/10' : 'border-slate-600 hover:border-slate-500'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{ cursor: 'pointer' }}
      >
        <div className="text-4xl mb-2">📁</div>
        <p className="text-text-secondary text-sm">Drag & drop CSV or <span className="text-accent">browse</span></p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
        />
      </div>

      {uploadMutation.isPending && <div className="text-text-secondary text-sm text-center">Uploading...</div>}
      {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}
      {result && (
        <div>
          <Alert
            type={result.errors.length === 0 ? 'success' : 'warning'}
            message={`Uploaded ${result.uploaded} of ${result.total} fixtures. ${result.errors.length > 0 ? `${result.errors.length} errors.` : ''}`}
          />
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.errors.map((e, i) => (
                <li key={i} className="text-danger text-xs">• {e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function CreateFixtureForm() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FixtureForm>({
    defaultValues: { kickoff_tz: '+05:30' },
  });
  const kickoffDate = watch('kickoff_date');
  const kickoffTz = watch('kickoff_tz');

  const mutation = useMutation({
    mutationFn: (data: FixtureForm) => adminApi.createFixture({
      ...data,
      match_number: Number(data.match_number),
      kickoff_time: toISO(data.kickoff_date, data.kickoff_tz),
    }),
    onSuccess: () => {
      setSuccess('Fixture created successfully!');
      reset();
      queryClient.invalidateQueries({ queryKey: ['admin', 'fixtures'] });
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create fixture');
    },
  });

  return (
    <div className="card space-y-4">
      <h2 className="font-semibold text-text-primary">➕ Add Fixture Manually</h2>

      {success && <Alert type="success" message={success} />}
      {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Match #</label>
            <input type="number" min={1} className="input" {...register('match_number', { required: true, min: 1 })} />
          </div>
          <div>
            <label className="label">Stage</label>
            <select className="input" {...register('stage', { required: true })}>
              {STAGES.map((s) => <option key={s} value={s}>{formatStageName(s)}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Home Team</label>
            <select className="input" {...register('home_team', { required: true })}>
              <option value="">Select team...</option>
              {SORTED_TEAMS.map((t) => (
                <option key={t.code} value={t.name}>{t.flag} {t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Away Team</label>
            <select className="input" {...register('away_team', { required: true })}>
              <option value="">Select team...</option>
              {SORTED_TEAMS.map((t) => (
                <option key={t.code} value={t.name}>{t.flag} {t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Kickoff Date &amp; Time</label>
          <div className="flex gap-2 flex-wrap">
            <input
              type="datetime-local"
              className="input flex-1"
              style={{ colorScheme: 'dark', minWidth: '13rem' }}
              {...register('kickoff_date', { required: 'Kickoff date is required' })}
            />
            <select className="input" style={{ maxWidth: '14rem' }} {...register('kickoff_tz', { required: true })}>
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
          {errors.kickoff_date && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.kickoff_date.message}</p>}
          {kickoffDate && (
            <p className="text-xs mt-1" style={{ color: '#6b89b4' }}>
              Stored as: <code style={{ color: '#f5b800' }}>{toISO(kickoffDate, kickoffTz)}</code>
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          <input type="checkbox" {...register('penalty_enabled')} className="w-4 h-4 accent-yellow-400" />
          Penalty shootout enabled (knockout matches only)
        </label>

        <Button type="submit" isLoading={mutation.isPending} fullWidth>
          Create Fixture
        </Button>
      </form>
    </div>
  );
}

function FixtureList() {
  const queryClient = useQueryClient();
  const [editFixture, setEditFixture] = useState<(Fixture & { prediction_count: number }) | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'fixtures'],
    queryFn: () => adminApi.getFixtures().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteFixture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'fixtures'] });
      setDeleteId(null);
      setAlert({ type: 'success', message: 'Fixture deleted' });
    },
    onError: (err: any) => {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Delete failed' });
    },
  });

  const rescoreMutation = useMutation({
    mutationFn: (id: string) => adminApi.rescore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'fixtures'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'predictions'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      setAlert({ type: 'success', message: 'Predictions rescored and leaderboard updated!' });
    },
    onError: (err: any) => {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Rescore failed' });
    },
  });

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-900/50 text-blue-300',
    live: 'bg-success/20 text-success',
    completed: 'bg-slate-700 text-slate-400',
  };

  return (
    <div className="card space-y-3">
      <h2 className="font-semibold text-text-primary">📋 All Fixtures ({data?.length ?? 0})</h2>

      {alert && <Alert type={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />}

      {isLoading && <div className="text-text-secondary text-sm">Loading...</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-secondary text-xs uppercase border-b border-slate-700">
              <th className="pb-2 text-left">#</th>
              <th className="pb-2 text-left">Match</th>
              <th className="pb-2 text-left">Kickoff</th>
              <th className="pb-2 text-left">Stage</th>
              <th className="pb-2 text-left">Status</th>
              <th className="pb-2 text-right">Preds</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {data?.map((f) => (
              <tr key={f.id} className="hover:bg-slate-700/20">
                <td className="py-2 text-text-secondary">{f.match_number}</td>
                <td className="py-2 text-text-primary font-medium">
                  <TeamFlag name={f.home_team} className="w-5 h-3.5 rounded-sm inline-block mr-1" />{f.home_team} vs <TeamFlag name={f.away_team} className="w-5 h-3.5 rounded-sm inline-block mr-1" />{f.away_team}
                </td>
                <td className="py-2 text-text-secondary text-xs">{formatKickoffIST(f.kickoff_time)}</td>
                <td className="py-2"><span className="badge bg-slate-700 text-slate-300">{f.stage}</span></td>
                <td className="py-2"><span className={`badge ${statusColors[f.status]}`}>{f.status}</span></td>
                <td className="py-2 text-right text-text-secondary">{f.prediction_count}</td>
                <td className="py-2 text-right">
                  <button onClick={() => setEditFixture(f)} className="text-accent hover:underline text-xs mr-2">Edit</button>
                  {f.status === 'completed' && (
                    <button
                      onClick={() => rescoreMutation.mutate(f.id)}
                      disabled={rescoreMutation.isPending}
                      className="text-xs mr-2 hover:underline"
                      style={{ color: '#22c55e' }}
                    >
                      {rescoreMutation.isPending ? '…' : 'Rescore'}
                    </button>
                  )}
                  {f.status === 'scheduled' && (
                    <button onClick={() => setDeleteId(f.id)} className="text-danger hover:underline text-xs">Del</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Fixture" size="sm">
        <p className="text-text-secondary mb-4">Are you sure? This will also delete all predictions for this fixture.</p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={() => deleteId && deleteMutation.mutate(deleteId)} isLoading={deleteMutation.isPending}>
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
        </div>
      </Modal>

      {/* Edit modal */}
      {editFixture && (
        <EditFixtureModal
          fixture={editFixture}
          onClose={() => setEditFixture(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'fixtures'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'predictions'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
            setEditFixture(null);
            setAlert({ type: 'success', message: 'Fixture updated' });
          }}
        />
      )}
    </div>
  );
}

function ScoreStepper({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const val = value ?? 0;
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(Math.max(0, val - 1))}
        className="w-9 h-9 rounded-lg font-black text-xl flex items-center justify-center transition-all active:scale-90"
        style={{ background: 'rgba(255,255,255,0.08)', color: '#eef2ff', border: '1px solid rgba(255,255,255,0.1)' }}>
        −
      </button>
      <span className="font-black text-2xl tabular-nums min-w-[1.5ch] text-center" style={{ color: '#f5b800' }}>{val}</span>
      <button type="button" onClick={() => onChange(Math.min(20, val + 1))}
        className="w-9 h-9 rounded-lg font-black text-xl flex items-center justify-center transition-all active:scale-90"
        style={{ background: 'rgba(255,255,255,0.08)', color: '#eef2ff', border: '1px solid rgba(255,255,255,0.1)' }}>
        +
      </button>
    </div>
  );
}

function EditFixtureModal({ fixture, onClose, onSuccess }: {
  fixture: Fixture;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [error, setError] = useState('');
  const [homeScore, setHomeScore] = useState<number>(fixture.home_score ?? 0);
  const [awayScore, setAwayScore] = useState<number>(fixture.away_score ?? 0);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      home_team: fixture.home_team,
      away_team: fixture.away_team,
      stage: fixture.stage,
      status: fixture.status,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: any) => adminApi.updateFixture(fixture.id, {
      ...data,
      home_score: homeScore,
      away_score: awayScore,
    }),
    onSuccess,
    onError: (err: any) => setError(err.response?.data?.error || 'Update failed'),
  });

  // result indicator
  const resultColor = homeScore > awayScore ? '#4ade80' : awayScore > homeScore ? '#f87171' : '#fbbf24';
  const resultText = homeScore > awayScore
    ? `${fixture.home_team} Win`
    : awayScore > homeScore ? `${fixture.away_team} Win` : 'Draw';

  return (
    <Modal isOpen onClose={onClose} title={`Edit Match #${fixture.match_number}`}>
      {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-3 mt-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Home Team</label>
            <select className="input" {...register('home_team', { required: true })}>
              {SORTED_TEAMS.map((t) => (
                <option key={t.code} value={t.name}>{t.flag} {t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Away Team</label>
            <select className="input" {...register('away_team', { required: true })}>
              {SORTED_TEAMS.map((t) => (
                <option key={t.code} value={t.name}>{t.flag} {t.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Stage</label>
            <select className="input" {...register('stage')}>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" {...register('status')}>
              {['scheduled', 'live', 'completed'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Score</label>
          <div className="flex items-center gap-4 mt-1">
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase mb-2" style={{ color: '#6b89b4' }}>
                <TeamFlag name={fixture.home_team} className="w-6 h-4 rounded-sm inline-block mr-1" />{fixture.home_team}
              </div>
              <ScoreStepper value={homeScore} onChange={setHomeScore} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-black text-2xl" style={{ color: '#3d5a80' }}>-</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                style={{ color: resultColor, background: 'rgba(0,0,0,0.3)', border: `1px solid ${resultColor}30` }}>
                {resultText}
              </span>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase mb-2" style={{ color: '#6b89b4' }}>
                <TeamFlag name={fixture.away_team} className="w-6 h-4 rounded-sm inline-block mr-1" />{fixture.away_team}
              </div>
              <ScoreStepper value={awayScore} onChange={setAwayScore} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" isLoading={mutation.isPending}>Save Changes</Button>
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

function UserManagement() {
  const queryClient = useQueryClient();
  const [resetTarget, setResetTarget] = useState<{ id: string; username: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getUsers().then((r) => r.data),
  });

  const resetMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => adminApi.resetPassword(id, password),
    onSuccess: () => {
      setResetTarget(null);
      setNewPassword('');
      setAlert({ type: 'success', message: 'Password reset successfully. User sessions revoked.' });
    },
    onError: (err: any) => setAlert({ type: 'error', message: err.response?.data?.error || 'Reset failed' }),
  });

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">👥 Users ({users?.length ?? 0})</h2>
          <button onClick={() => setCreateOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide"
            style={{ background: '#f5b800', color: '#020c1f' }}>
            + Add User
          </button>
        </div>

        {alert && <Alert type={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />}
        {isLoading && <div className="text-text-secondary text-sm">Loading...</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-secondary text-xs uppercase border-b border-slate-700">
                <th className="pb-2 text-left">Username</th>
                <th className="pb-2 text-left">Email</th>
                <th className="pb-2 text-left">Role</th>
                <th className="pb-2 text-left">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {users?.map((u) => (
                <tr key={u.id} className="hover:bg-slate-700/20">
                  <td className="py-2 font-medium text-text-primary">@{u.username}</td>
                  <td className="py-2 text-text-secondary text-xs">{u.email}</td>
                  <td className="py-2">
                    <span className="badge text-xs px-2 py-0.5 rounded"
                      style={u.role === 'admin'
                        ? { background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }
                        : { background: 'rgba(22,163,74,0.15)', color: '#4ade80' }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className="badge text-xs" style={u.is_active
                      ? { color: '#4ade80' } : { color: '#f87171' }}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <button onClick={() => { setResetTarget({ id: u.id, username: u.username }); setNewPassword(''); }}
                      className="text-xs font-bold hover:underline" style={{ color: '#f5b800' }}>
                      Reset PW
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset password modal */}
      <Modal isOpen={!!resetTarget} onClose={() => setResetTarget(null)} title={`Reset Password — @${resetTarget?.username}`} size="sm">
        <div className="space-y-3 mt-2">
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" placeholder="Min 8 characters"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => resetTarget && resetMutation.mutate({ id: resetTarget.id, password: newPassword })}
              isLoading={resetMutation.isPending} disabled={newPassword.length < 8}>
              Reset Password
            </Button>
            <Button variant="secondary" onClick={() => setResetTarget(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Create user modal */}
      {createOpen && <CreateUserModal onClose={() => setCreateOpen(false)} onSuccess={() => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        setCreateOpen(false);
        setAlert({ type: 'success', message: 'User created successfully' });
      }} />}
    </div>
  );
}

function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<{
    email: string; username: string; password: string; role: string;
  }>({ defaultValues: { role: 'user' } });

  const mutation = useMutation({
    mutationFn: (data: any) => adminApi.createUser(data),
    onSuccess,
    onError: (err: any) => setError(err.response?.data?.error || 'Failed to create user'),
  });

  return (
    <Modal isOpen onClose={onClose} title="Add New User">
      {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-3 mt-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="user@example.com"
              {...register('email', { required: 'Required' })} />
            {errors.email && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Username</label>
            <input type="text" className="input" placeholder="player_name"
              {...register('username', { required: 'Required', pattern: { value: /^[a-zA-Z0-9_]{3,50}$/, message: 'Alphanumeric/underscore, 3-50 chars' } })} />
            {errors.username && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.username.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Min 8 chars"
              {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} />
            {errors.password && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.password.message}</p>}
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" {...register('role')}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" isLoading={mutation.isPending}>Create User</Button>
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

function AdminLogs() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: () => adminApi.getLogs({ limit: 50 }).then((r) => r.data),
    staleTime: 30 * 1000,
  });

  return (
    <div className="card space-y-3">
      <h2 className="font-semibold text-text-primary">📜 Admin Activity Log</h2>
      {isLoading && <div className="text-text-secondary text-sm">Loading...</div>}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {data?.map((log) => (
          <div key={log.id} className="text-xs bg-slate-800 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-accent font-medium">{log.action}</span>
              <span className="text-text-secondary">{new Date(log.created_at).toLocaleString()}</span>
            </div>
            <div className="text-text-secondary">{log.admin_email}</div>
            <div className="text-slate-500 font-mono text-xs mt-1 truncate">{JSON.stringify(log.details)}</div>
          </div>
        ))}
        {data?.length === 0 && <p className="text-text-secondary text-sm">No logs yet</p>}
      </div>
    </div>
  );
}

function AllPredictions() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'predictions'],
    queryFn: () => adminApi.getPredictions().then((r) => r.data),
    staleTime: 30 * 1000,
  });

  const [expandedFixtures, setExpandedFixtures] = useState<Set<string>>(new Set());
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const toggleFixture = (id: string) =>
    setExpandedFixtures((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const resultBadge = (result: string | null) => {
    if (!result) return <span className="text-slate-500 text-xs">–</span>;
    const map: Record<string, { label: string; cls: string }> = {
      exact:  { label: '🎯 Exact',  cls: 'bg-green-900 text-green-300' },
      winner: { label: '✅ Winner', cls: 'bg-blue-900 text-blue-300' },
      wrong:  { label: '❌ Wrong',  cls: 'bg-red-900 text-red-300' },
    };
    const b = map[result] ?? { label: result, cls: 'bg-slate-700 text-slate-300' };
    return <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${b.cls}`}>{b.label}</span>;
  };

  if (isLoading) return <div className="card text-text-secondary text-sm">Loading predictions…</div>;

  const groups = data ?? [];
  const totalPredictions = groups.reduce((s, g) => s + g.predictions.length, 0);

  const upcoming = groups.filter((g) => g.fixture.status === 'scheduled' || g.fixture.status === 'live');
  const completed = groups.filter((g) => g.fixture.status === 'completed');

  const renderFixtureCard = ({ fixture: f, predictions, pending_users: _pending }: typeof groups[0]) => {
    const pending_users: string[] = _pending ?? [];
    const isOpen = expandedFixtures.has(f.id);
    const statusColors: Record<string, string> = {
      scheduled: 'text-blue-400',
      live: 'text-green-400',
      completed: 'text-slate-400',
    };
    const scoreDisplay =
      f.home_score !== null && f.away_score !== null
        ? `${f.home_score}–${f.away_score}`
        : 'TBD';

    return (
      <div key={f.id} className="card overflow-hidden p-0">
        <button
          className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors"
          onClick={() => toggleFixture(f.id)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-text-secondary text-xs shrink-0">M{f.match_number}</span>
            <span className="text-text-primary font-medium text-sm truncate">
              <TeamFlag name={f.home_team} className="w-5 h-3.5 rounded-sm inline-block mr-1" />{f.home_team} vs <TeamFlag name={f.away_team} className="w-5 h-3.5 rounded-sm inline-block mr-1" />{f.away_team}
            </span>
            <span className={`text-xs font-medium shrink-0 ${statusColors[f.status] ?? 'text-slate-400'}`}>
              {f.status === 'completed' ? scoreDisplay : f.status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {pending_users.length > 0 && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                {pending_users.length} pending
              </span>
            )}
            <span className="text-xs text-text-secondary">{predictions.length} submitted</span>
            <span className="text-text-secondary text-xs">{isOpen ? '▲' : '▼'}</span>
          </div>
        </button>

        {isOpen && (
          <div className="border-t border-slate-700">
            {/* Pending users */}
            {pending_users.length > 0 && (
              <div className="px-4 py-3 border-b border-slate-700/50" style={{ background: 'rgba(239,68,68,0.05)' }}>
                <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#f87171' }}>
                  Not submitted yet
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {pending_users.map((u) => (
                    <span key={u} className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}>
                      @{u}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Predictions table */}
            {predictions.length === 0 ? (
              <p className="px-4 py-3 text-text-secondary text-sm">No predictions yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 text-text-secondary text-xs">
                    <th className="text-left px-4 py-2">Player</th>
                    <th className="text-center px-3 py-2">Prediction</th>
                    <th className="text-center px-3 py-2">Result</th>
                    <th className="text-center px-3 py-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p) => (
                    <tr key={p.id} className="border-t border-slate-700/50 hover:bg-slate-800/40">
                      <td className="px-4 py-2 text-text-primary font-medium">{p.username}</td>
                      <td className="px-3 py-2 text-center font-mono text-text-primary">
                        {p.home_goals}–{p.away_goals}
                      </td>
                      <td className="px-3 py-2 text-center">{resultBadge(p.result)}</td>
                      <td className="px-3 py-2 text-center">
                        {p.points !== null ? (
                          <span className={`font-bold ${p.points >= 8 ? 'text-green-400' : p.points >= 3 ? 'text-blue-400' : 'text-slate-400'}`}>
                            {p.points}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">–</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    );
  };

  const SectionHeader = ({
    label, count, pendingCount, open, onToggle,
  }: { label: string; count: number; pendingCount: number; open: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-colors hover:bg-slate-800"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-text-primary">{label}</span>
        <span className="text-xs text-text-secondary">({count} matches)</span>
        {pendingCount > 0 && (
          <span className="text-xs font-bold px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
            {pendingCount} with pending
          </span>
        )}
      </div>
      <span className="text-text-secondary text-xs">{open ? '▲' : '▼'}</span>
    </button>
  );

  const upcomingPendingCount = upcoming.filter((g) => (g.pending_users ?? []).length > 0).length;
  const completedPendingCount = completed.filter((g) => (g.pending_users ?? []).length > 0).length;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="card flex gap-6 text-sm">
        <div>
          <div className="text-text-secondary text-xs">Total predictions</div>
          <div className="text-text-primary font-bold text-lg">{totalPredictions}</div>
        </div>
        <div>
          <div className="text-text-secondary text-xs">Upcoming + Live</div>
          <div className="text-text-primary font-bold text-lg">{upcoming.length}</div>
        </div>
        <div>
          <div className="text-text-secondary text-xs">Completed</div>
          <div className="text-text-primary font-bold text-lg">{completed.length}</div>
        </div>
      </div>

      {/* Pending reminder export */}
      <div className="card">
        <div className="font-semibold text-text-primary text-sm mb-3">Export Pending Reminders</div>
        <PendingReminderExport groups={upcoming} />
      </div>

      {/* Upcoming + Live section */}
      <div className="space-y-2">
        <SectionHeader
          label="Upcoming + Live"
          count={upcoming.length}
          pendingCount={upcomingPendingCount}
          open={showUpcoming}
          onToggle={() => setShowUpcoming((v) => !v)}
        />
        {showUpcoming && (
          <div className="space-y-2 pl-1">
            {upcoming.length === 0
              ? <p className="text-text-secondary text-sm px-2">No upcoming fixtures.</p>
              : upcoming.map((g) => renderFixtureCard(g))}
          </div>
        )}
      </div>

      {/* Completed section */}
      <div className="space-y-2">
        <SectionHeader
          label="Completed"
          count={completed.length}
          pendingCount={completedPendingCount}
          open={showCompleted}
          onToggle={() => setShowCompleted((v) => !v)}
        />
        {showCompleted && (
          <div className="space-y-2 pl-1">
            {completed.length === 0
              ? <p className="text-text-secondary text-sm px-2">No completed fixtures yet.</p>
              : completed.map((g) => renderFixtureCard(g))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'upload' | 'create' | 'fixtures' | 'users' | 'predictions' | 'export' | 'logs'>('upload');

  const tabs = [
    { key: 'upload', label: '📤 Upload CSV' },
    { key: 'create', label: '➕ Add Fixture' },
    { key: 'fixtures', label: '📋 Manage' },
    { key: 'users', label: '👥 Users' },
    { key: 'predictions', label: '🔮 Predictions' },
    { key: 'export', label: '📸 Export' },
    { key: 'logs', label: '📜 Logs' },
  ] as const;

  return (
    <div className="min-h-screen pb-6">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">⚙ Admin Dashboard</h1>
          <p className="text-text-secondary text-sm">Manage World Cup fixtures</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key ? 'bg-accent text-white' : 'bg-surface text-text-secondary border border-slate-700 hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'upload' && <UploadSection />}
        {activeTab === 'create' && <CreateFixtureForm />}
        {activeTab === 'fixtures' && <FixtureList />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'predictions' && <AllPredictions />}
        {activeTab === 'export' && <ExportTab />}
        {activeTab === 'logs' && <AdminLogs />}
      </main>
    </div>
  );
}
