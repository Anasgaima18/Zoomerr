import { useContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import { AuthContext } from './context/AuthContextDefinition';
import { SocketProvider } from './context/SocketProvider';

// Lazy Load Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Room = lazy(() => import('./pages/Room'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Chat = lazy(() => import('./pages/Chat'));
const CallHistory = lazy(() => import('./pages/CallHistory'));
const Scheduler = lazy(() => import('./pages/Scheduler'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

import './index.css';

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0b1120] text-blue-400 font-mono">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-sm tracking-wider">LOADING SYSTEM...</span>
    </div>
  </div>
);

// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-primary">Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Wrapper (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-primary">Loading...</div>;

  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/room/:meetingId"
                element={
                  <PrivateRoute>
                    <Room />
                  </PrivateRoute>
                }
              />
              {/* New UI Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/history" element={<CallHistory />} />
              <Route path="/schedule" element={<Scheduler />} />
              <Route path="/" element={<LandingPage />} />
            </Routes>
          </Suspense>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
