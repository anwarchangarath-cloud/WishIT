import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dreams from './pages/Dreams';
import SubmitDream from './pages/SubmitDream';
import Dashboard from './pages/Dashboard';
import ModeratorDashboard from './pages/ModeratorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuccessStories from './pages/SuccessStories';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import FulfillerProfile from './pages/FulfillerProfile';
import NotFound from './pages/NotFound';
import Legal from './pages/Legal';

function ProtectedRoute({ children, roles }) {
  const { user, profile, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dreams" element={<Dreams />} />
      <Route path="/stories" element={<SuccessStories />} />
      <Route path="/fulfiller/:uid" element={<FulfillerProfile />} />

      {/* Legal / info pages */}
      <Route path="/privacy" element={<Legal />} />
      <Route path="/terms" element={<Legal />} />
      <Route path="/trust" element={<Legal />} />
      <Route path="/about" element={<Legal />} />
      <Route path="/contact" element={<Legal />} />
      <Route path="/careers" element={<Legal />} />
      <Route path="/report" element={<Legal />} />

      {/* Protected — any authenticated user */}
      <Route path="/submit-dream" element={
        <ProtectedRoute><SubmitDream /></ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute><Messages /></ProtectedRoute>
      } />
      <Route path="/messages/:dreamId" element={
        <ProtectedRoute><Messages /></ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute><Notifications /></ProtectedRoute>
      } />

      {/* Protected — moderator + admin */}
      <Route path="/moderator" element={
        <ProtectedRoute roles={['moderator', 'admin']}><ModeratorDashboard /></ProtectedRoute>
      } />

      {/* Protected — admin only */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
