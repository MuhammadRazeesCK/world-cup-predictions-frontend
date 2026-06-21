import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', icon: '⚽', label: 'Home' },
  { to: '/leaderboard', icon: '🏆', label: 'Standings' },
  { to: '/history', icon: '📋', label: 'My Picks' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

export function Footer() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 sm:hidden z-40" style={{ background: '#030d1f', borderTop: '1px solid rgba(245,184,0,0.15)' }}>
      <div className="flex">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to}
            className="flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-bold uppercase tracking-wide transition-colors"
            style={{ color: pathname === item.to ? '#f5b800' : '#3d5a80' }}>
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
