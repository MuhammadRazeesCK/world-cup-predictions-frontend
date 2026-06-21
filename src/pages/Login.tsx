import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

interface LoginForm { email: string; password: string; }

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError(''); setLoading(true);
    try { await login(data.email, data.password); navigate('/'); }
    catch (e: any) { setError(e.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3" style={{ background: 'rgba(245,184,0,0.1)', border: '2px solid rgba(245,184,0,0.3)' }}>
            <span className="text-3xl">⚽</span>
          </div>
          <div className="font-black text-2xl text-text-primary uppercase tracking-tight">World Cup 2026</div>
          <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: '#f5b800' }}>Predictions League</div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: '#071428', border: '1px solid rgba(26,58,107,0.8)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div className="h-1" style={{ background: 'linear-gradient(90deg,#f5b800,#16a34a,#3b82f6,#f5b800)' }} />
          <div className="px-6 py-6">
            <h2 className="font-black text-lg text-text-primary uppercase mb-5">Sign In</h2>

            {error && (
              <div className="mb-4 px-3 py-2 rounded-lg text-xs font-bold" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>{error}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input type="email" autoComplete="email" className="input" placeholder="you@example.com"
                  {...register('email', { required: 'Email is required' })} />
                {errors.email && <p className="text-xs mt-1 font-bold" style={{ color: '#dc2626' }}>{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" autoComplete="current-password" className="input" placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })} />
                {errors.password && <p className="text-xs mt-1 font-bold" style={{ color: '#dc2626' }}>{errors.password.message}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg font-black text-sm uppercase tracking-wide transition-all disabled:opacity-40 active:scale-95"
                style={{ background: '#f5b800', color: '#020c1f' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs mt-5" style={{ color: '#3d5a80' }}>
              No account?{' '}
              <Link to="/signup" className="font-bold transition-colors" style={{ color: '#f5b800' }}>Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
