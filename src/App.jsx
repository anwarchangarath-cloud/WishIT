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

function ProtectedRoute({ children, roles }) {
  const { user, profile } = useAuth();
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

      <Route path="*" element={<Navigate to="/" replace />} />
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
