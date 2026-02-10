import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import WorkerDashboard from './components/Dashboard/WorkerDashboard';
import CheckpointAdminDashboard from './components/Dashboard/CheckpointAdminDashboard';
import SuperAdminDashboard from './components/Dashboard/SuperAdminDashboard';
import VehicleEntry from './components/VehicleEntry/VehicleEntry';
import Profile from './components/Profile/Profile';
import ManageWorkers from './components/Worker/ManageWorkers';
import VehicleLogs from './components/VehicleLogs/VehicleLogs';
import ManageCheckpoints from './components/SuperAdmin/ManageCheckpoints';
import AllVehicles from './components/SuperAdmin/AllVehicles';
import NotFound from './components/NotFound';

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'WORKER':
      return <WorkerDashboard />;
    case 'CHECKPOINT ADMIN':
      return <CheckpointAdminDashboard />;
    case 'SUPER ADMIN':
      return <SuperAdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/vehicle-entry"
              element={
                <ProtectedRoute requiredRole={['WORKER']}>
                  <VehicleEntry />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/manage-workers"
              element={
                <ProtectedRoute requiredRole={['CHECKPOINT ADMIN']}>
                  <ManageWorkers />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/vehicle-logs"
              element={
                <ProtectedRoute requiredRole={['CHECKPOINT ADMIN']}>
                  <VehicleLogs />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/manage-checkpoints"
              element={
                <ProtectedRoute requiredRole={['SUPER ADMIN']}>
                  <ManageCheckpoints />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/all-vehicles"
              element={
                <ProtectedRoute requiredRole={['SUPER ADMIN']}>
                  <AllVehicles />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;