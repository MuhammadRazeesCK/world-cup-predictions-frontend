import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AUTH_THEME as T } from '../styles/authTheme';

interface LoginForm { email: string; password: string; }

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M9.88 9.88A3 3 0 0114.12 14.12M3 3l18 18" />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError(''); setLoading(true);
    try { await login(data.email, data.password); navigate('/'); }
    catch (e: any) { setError(e.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      {/* Logo mark */}
      <div className="mb-8">
        <h2
          className="font-black uppercase tracking-tight text-white"
          style={{ fontSize: '2rem', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.04em', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
        >
          Welcome Back
        </h2>
        <p className="text-sm mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
          Your league is waiting.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mb-5 px-4 py-3 rounded-lg text-sm font-semibold"
          style={{ background: 'rgba(239,68,68,0.12)', border: `1px solid rgba(239,68,68,0.3)`, color: '#fca5a5' }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="auth-input w-full px-4 py-3 rounded-xl text-sm font-medium text-white placeholder-[rgba(255,255,255,0.3)] outline-none transition-all"
            style={{
              background: T.inputBg,
              border: `1px solid ${T.borderColor}`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="text-xs mt-1.5 font-semibold" style={{ color: T.danger }}>{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="auth-input w-full px-4 py-3 pr-11 rounded-xl text-sm font-medium text-white placeholder-[rgba(255,255,255,0.3)] outline-none transition-all"
              style={{
                background: T.inputBg,
                border: `1px solid ${T.borderColor}`,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'rgba(238,242,255,0.35)' }}
            >
              <EyeIcon open={showPw} />
            </button>
          </div>
          {errors.password && <p className="text-xs mt-1.5 font-semibold" style={{ color: T.danger }}>{errors.password.message}</p>}
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-40 active:scale-[0.98] mt-2"
          style={{ background: T.gold, color: '#020c1f', boxShadow: `0 4px 24px rgba(245,184,0,0.25)` }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {/* Footer link */}
      <p className="text-center text-sm mt-7" style={{ color: 'rgba(255,255,255,0.4)' }}>
        No account?{' '}
        <Link
          to="/signup"
          className="font-bold transition-colors hover:opacity-80"
          style={{ color: T.gold }}
        >
          Join the league
        </Link>
      </p>
    </AuthLayout>
  );
}
