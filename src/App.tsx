import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PredictionHistory from './pages/PredictionHistory';
import LeaderboardPage from './pages/Leaderboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';

function RequireAuth({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="text-text-secondary">Loading...</div></div>;
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAdmin } = useAuth();
    if (isLoading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return <>{children}</>;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    if (isLoading) return null;
    if (user) return <Navigate to="/" replace />;
    return <>{children}</>;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/history" element={<RequireAuth><PredictionHistory /></RequireAuth>} />
            <Route path="/leaderboard" element={<RequireAuth><LeaderboardPage /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
