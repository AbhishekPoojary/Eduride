import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Flex, Spinner } from '@chakra-ui/react';

// Layout components
import Layout from './components/layout/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard';
import BusTracking from './pages/buses/BusTracking';
import BusManagement from './pages/buses/BusManagement';
import BusFares from './pages/buses/BusFares';
import Students from './pages/users/Students';
import Parents from './pages/users/Parents';
import Faculty from './pages/users/Faculty';
import Profile from './pages/profile/Profile';
import Notifications from './pages/notifications/Notifications';
import Payment from './pages/payment/Payment';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminSettings from './pages/admin/Settings';

// Context
import { useAuth } from './context/AuthContext';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Box>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Regular user routes */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bus-tracking" element={<BusTracking />} />
          <Route path="bus-fares" element={<BusFares />} />
          <Route path="payment" element={<Payment />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
          
          {/* Admin routes */}
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="admin/buses" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BusManagement />
            </ProtectedRoute>
          } />
          <Route path="admin/students" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Students />
            </ProtectedRoute>
          } />
          <Route path="admin/parents" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Parents />
            </ProtectedRoute>
          } />
          <Route path="admin/faculty" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Faculty />
            </ProtectedRoute>
          } />
          <Route path="admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSettings />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
