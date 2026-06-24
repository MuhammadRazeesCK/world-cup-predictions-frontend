import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AUTH_THEME as T } from '../styles/authTheme';

interface SignupForm { email: string; username: string; password: string; confirmPassword: string; }

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

// Reusable styled input for this page
function AuthInput({
  label, type, placeholder, autoComplete, showToggle, show, onToggle, registration, error,
}: {
  label: string; type: string; placeholder: string; autoComplete?: string;
  showToggle?: boolean; show?: boolean; onToggle?: () => void;
  registration: object; error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show !== undefined ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="auth-input w-full px-4 py-3 rounded-xl text-sm font-medium text-white placeholder-[rgba(255,255,255,0.3)] outline-none transition-all"
          style={{
            background: T.inputBg,
            border: `1px solid ${T.borderColor}`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            paddingRight: showToggle ? '2.75rem' : undefined,
          }}
          {...registration}
        />
        {showToggle && onToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: 'rgba(238,242,255,0.35)' }}
          >
            <EyeIcon open={!!show} />
          </button>
        )}
      </div>
      {error && <p className="text-xs mt-1.5 font-semibold" style={{ color: T.danger }}>{error}</p>}
    </div>
  );
}

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupForm>();
  const password = watch('password');

  const onSubmit = async (data: SignupForm) => {
    setError(''); setLoading(true);
    try { await signup(data.email, data.username, data.password); navigate('/'); }
    catch (e: any) { setError(e.response?.data?.error || 'Sign up failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      {/* Logo mark */}
      <div className="mb-7">
        <h2
          className="font-black uppercase tracking-tight text-white"
          style={{ fontSize: '2rem', fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.04em', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
        >
          Join the League
        </h2>
        <p className="text-sm mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
          Pick your winners. Claim your glory.
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          registration={register('email', {
            required: 'Required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
          })}
          error={errors.email?.message}
        />
        <AuthInput
          label="Username"
          type="text"
          placeholder="player_123"
          autoComplete="username"
          registration={register('username', {
            required: 'Required',
            minLength: { value: 3, message: 'Min 3 chars' },
            maxLength: { value: 50, message: 'Max 50 chars' },
            pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers & underscore only' },
          })}
          error={errors.username?.message}
        />
        <AuthInput
          label="Password"
          type="password"
          placeholder="Min 8 chars, uppercase, number, special"
          autoComplete="new-password"
          showToggle
          show={showPw}
          onToggle={() => setShowPw(v => !v)}
          registration={register('password', {
            required: 'Required',
            minLength: { value: 8, message: 'Min 8 characters' },
            validate: v => {
              if (!/[A-Z]/.test(v)) return 'Need 1 uppercase letter';
              if (!/\d/.test(v))    return 'Need 1 number';
              if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v)) return 'Need 1 special character';
              return true;
            },
          })}
          error={errors.password?.message}
        />
        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="Repeat password"
          autoComplete="new-password"
          showToggle
          show={showConfirm}
          onToggle={() => setShowConfirm(v => !v)}
          registration={register('confirmPassword', {
            required: 'Required',
            validate: v => v === password || 'Passwords do not match',
          })}
          error={errors.confirmPassword?.message}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-40 active:scale-[0.98] mt-2"
          style={{ background: T.gold, color: '#020c1f', boxShadow: `0 4px 24px rgba(245,184,0,0.25)` }}
        >
          {loading ? 'Creating account…' : 'Join the League'}
        </button>
      </form>

      <p className="text-center text-sm mt-7" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-bold hover:opacity-80 transition-opacity"
          style={{ color: T.gold }}
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
