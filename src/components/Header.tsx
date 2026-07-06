import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FlagBunting } from './FlagBunting';
import { useQuery } from '@tanstack/react-query';
import { pollsApi } from '../api/polls';

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { pathname } = useLocation();

  // Unvoted live polls — for badge indicator (non-admin only)
  const { data: polls = [] } = useQuery({
    queryKey: ['polls'],
    queryFn: pollsApi.getPolls,
    enabled: !!user && !isAdmin,
    staleTime: 60_000,
  });
  const unvotedCount = polls.filter((p) => !p.isClosed && p.userVote === null).length;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/leaderboard', label: 'Standings' },
    { to: '/history', label: 'My Picks' },
    ...(!isAdmin ? [{ to: '/polls', label: 'Polls' }] : []),
    { to: '/export', label: 'Export' },
    { to: '/profile', label: 'Profile' },
  ];

  const mobileLinks = [
    { to: '/', label: 'Home', icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" />
      </svg>
    )},
    { to: '/leaderboard', label: 'Standings', icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4a2 2 0 01-2-2V5h4" /><path d="M18 9h2a2 2 0 002-2V5h-4" />
        <path d="M12 17v4" /><path d="M8 21h8" />
        <path d="M4 5h16v4a8 8 0 01-16 0V5z" />
      </svg>
    )},
    { to: '/history', label: 'My Picks', icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" />
      </svg>
    )},
    ...(!isAdmin ? [{ to: '/polls', label: 'Polls', icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    )}] : []),
    { to: '/export', label: 'Export', icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
        <polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    )},
    { to: '/profile', label: 'Profile', icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    )},
  ];

  return (
    <>
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(10,10,10,0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Flag bunting strip */}
        <div style={{ background: 'rgba(6,8,9,0.55)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <FlagBunting />
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between py-3 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <img
                src="/assets/wc-logo.jpeg"
                alt="FIFA World Cup 2026"
                className="rounded-lg object-contain"
                style={{ width: 36, height: 36 }}
              />
              <div className="leading-tight">
                <div className="font-black text-white text-sm tracking-tight uppercase" style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1rem', letterSpacing: '0.06em' }}>
                  World Cup 2026
                </div>
                <div className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(245,184,0,0.7)' }}>
                  Predictions League
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const active = pathname === link.to;
                const isPollsLink = link.to === '/polls';
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="relative px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors"
                    style={{ color: active ? '#f5b800' : 'rgba(255,255,255,0.45)' }}
                  >
                    {link.label}
                    {isPollsLink && unvotedCount > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-black px-1"
                        style={{ background: '#f5b800', color: '#000' }}
                      >
                        {unvotedCount}
                      </span>
                    )}
                    {active && (
                      <span
                        className="absolute bottom-0 left-3 right-3 rounded-full"
                        style={{ height: '2px', background: '#f5b800' }}
                      />
                    )}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 ml-2 px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                  style={pathname === '/admin'
                    ? { background: 'rgba(245,184,0,0.15)', color: '#f5b800', border: '1px solid rgba(245,184,0,0.3)' }
                    : { color: 'rgba(245,184,0,0.5)', border: '1px solid rgba(245,184,0,0.15)' }}
                >
                  <SettingsIcon />
                  Admin
                </Link>
              )}
            </nav>

            {/* User / logout (desktop) */}
            {user && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="hidden sm:block text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  @{user.username}
                </span>
                <button
                  onClick={logout}
                  className="text-xs font-bold uppercase tracking-wide px-2.5 py-1.5 rounded-lg transition-all"
                  style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar — only shown on small screens when logged in */}
      {user && (
        <nav
          className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex"
          style={{
            background: 'rgba(10,10,10,0.97)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {mobileLinks.map((link) => {
            const active = pathname === link.to;
            const isPollsLink = link.to === '/polls';
            return (
              <Link
                key={link.to}
                to={link.to}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative"
                style={{ color: active ? '#f5b800' : 'rgba(255,255,255,0.35)' }}
              >
                <span className="relative">
                  {link.icon}
                  {isPollsLink && unvotedCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[14px] h-3.5 rounded-full flex items-center justify-center text-[8px] font-black px-0.5"
                      style={{ background: '#f5b800', color: '#000' }}
                    >
                      {unvotedCount}
                    </span>
                  )}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wide">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
