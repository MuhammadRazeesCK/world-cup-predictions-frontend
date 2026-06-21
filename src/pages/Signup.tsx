import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

interface SignupForm { email: string; username: string; password: string; confirmPassword: string; }

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupForm>();
  const password = watch('password');

  const onSubmit = async (data: SignupForm) => {
    setError(''); setLoading(true);
    try { await signup(data.email, data.username, data.password); navigate('/'); }
    catch (e: any) { setError(e.response?.data?.error || 'Sign up failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
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
            <h2 className="font-black text-lg text-text-primary uppercase mb-5">Create Account</h2>

            {error && (
              <div className="mb-4 px-3 py-2 rounded-lg text-xs font-bold" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>{error}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input type="email" autoComplete="email" className="input" placeholder="you@example.com"
                  {...register('email', { required: 'Required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} />
                {errors.email && <p className="text-xs mt-1 font-bold" style={{ color: '#dc2626' }}>{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Username</label>
                <input type="text" autoComplete="username" className="input" placeholder="player_123"
                  {...register('username', { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' }, maxLength: { value: 50, message: 'Max 50 chars' }, pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Alphanumeric + underscore only' } })} />
                {errors.username && <p className="text-xs mt-1 font-bold" style={{ color: '#dc2626' }}>{errors.username.message}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" autoComplete="new-password" className="input" placeholder="Min 8 chars, uppercase, number, special"
                  {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' },
                    validate: v => {
                      if (!/[A-Z]/.test(v)) return 'Need 1 uppercase';
                      if (!/\d/.test(v)) return 'Need 1 number';
                      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v)) return 'Need 1 special char';
                      return true;
                    }
                  })} />
                {errors.password && <p className="text-xs mt-1 font-bold" style={{ color: '#dc2626' }}>{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input type="password" autoComplete="new-password" className="input" placeholder="Repeat password"
                  {...register('confirmPassword', { required: 'Required', validate: v => v === password || 'Passwords do not match' })} />
                {errors.confirmPassword && <p className="text-xs mt-1 font-bold" style={{ color: '#dc2626' }}>{errors.confirmPassword.message}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg font-black text-sm uppercase tracking-wide transition-all disabled:opacity-40 active:scale-95"
                style={{ background: '#f5b800', color: '#020c1f' }}>
                {loading ? 'Creating...' : 'Join the League'}
              </button>
            </form>

            <p className="text-center text-xs mt-5" style={{ color: '#3d5a80' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-bold" style={{ color: '#f5b800' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
