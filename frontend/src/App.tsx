import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Donate from './pages/Donate';
import Request from './pages/Request';
import JoinUs from './pages/JoinUs';
import Login from './pages/Login';
import VolunteerDashboard from './pages/VolunteerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { CssBaseline } from '@mui/material';

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isLoginPage && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donate"
            element={
              <ProtectedRoute>
                <Donate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/request"
            element={
              <ProtectedRoute>
                <Request />
              </ProtectedRoute>
            }
          />
          <Route
            path="/join-us"
            element={
              <ProtectedRoute>
                <JoinUs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer-dashboard"
            element={
              <ProtectedRoute>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
      <Chatbot />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 