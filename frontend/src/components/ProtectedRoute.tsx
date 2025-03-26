import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Check if token is expired
  const isTokenExpired = () => {
    const expiresAt = localStorage.getItem('authExpiresAt');
    if (!expiresAt) return true;
    return new Date().getTime() > parseInt(expiresAt);
  };
     {/* foot */}

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }
     {/* foot */}

  // If no user or token is expired, redirect to login
  if (!user || isTokenExpired()) {
    // Save the attempted location, but don't save /join-us
    const from = location.pathname === '/join-us' ? '/' : location.pathname;
    return <Navigate to="/login" state={{ from }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 