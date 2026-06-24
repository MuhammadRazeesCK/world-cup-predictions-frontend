import { Link, useLocation } from 'react-router-dom';

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? '#f5b800' : 'none'} className="w-5 h-5" stroke={active ? '#f5b800' : 'rgba(255,255,255,0.35)'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function TrophyIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={active ? '#f5b800' : 'rgba(255,255,255,0.35)'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
      <path d="M12 17c-3.31 0-6-2.69-6-6V5h12v6c0 3.31-2.69 6-6 6z" />
      <path d="M12 17v3M8 20h8" />
    </svg>
  );
}

function ClipboardIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={active ? '#f5b800' : 'rgba(255,255,255,0.35)'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={active ? '#f5b800' : 'rgba(255,255,255,0.35)'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
    </svg>
  );
}

const navItems = [
  { to: '/',            label: 'Home',     Icon: HomeIcon },
  { to: '/leaderboard', label: 'Standings', Icon: TrophyIcon },
  { to: '/history',     label: 'My Picks', Icon: ClipboardIcon },
  { to: '/profile',     label: 'Profile',  Icon: UserIcon },
];

export function Footer() {
  const { pathname } = useLocation();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 sm:hidden z-40"
      style={{
        background: 'rgba(10,10,10,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex">
        {navItems.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center pt-2.5 pb-3 gap-1 transition-colors"
              style={{ borderTop: active ? '2px solid #f5b800' : '2px solid transparent' }}
            >
              <Icon active={active} />
              <span
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: active ? '#f5b800' : 'rgba(255,255,255,0.3)' }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

