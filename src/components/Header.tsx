import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { pathname } = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/leaderboard', label: 'Standings' },
    { to: '/history', label: 'My Picks' },
    { to: '/profile', label: 'Profile' },
  ];

  return (
    <header className="sticky top-0 z-40" style={{ background: 'linear-gradient(180deg,#030d1f 0%,rgba(3,13,31,0.97) 100%)', borderBottom: '1px solid rgba(245,184,0,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.6)' }}>
      {/* Host nation stripe */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg,#BF0A30 0%,#002868 25%,#f5b800 50%,#FF0000 75%,#003F87 100%)' }} />
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-full" style={{ background: 'rgba(245,184,0,0.12)', border: '1px solid rgba(245,184,0,0.3)' }}>
              <span className="text-xl">⚽</span>
            </div>
            <div className="leading-tight">
              <div className="font-black text-text-primary text-sm tracking-tight uppercase">World Cup 2026</div>
              <div className="text-xs font-bold tracking-widest" style={{ color: '#f5b800' }}>PREDICTIONS LEAGUE</div>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                style={pathname === link.to
                  ? { background: '#f5b800', color: '#020c1f' }
                  : { color: '#6b89b4' }}
              >{link.label}</Link>
            ))}
            {isAdmin && (
              <Link to="/admin"
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ml-1 transition-all"
                style={pathname === '/admin'
                  ? { background: '#f59e0b', color: '#020c1f' }
                  : { border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' }}
              >⚙ Admin</Link>
            )}
          </nav>

          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block px-2 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(245,184,0,0.08)', border: '1px solid rgba(245,184,0,0.15)', color: '#f5b800' }}>
                @{user.username}
              </div>
              <button onClick={logout} className="text-xs font-semibold transition-colors" style={{ color: '#3d5a80' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = '#dc2626'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = '#3d5a80'}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
