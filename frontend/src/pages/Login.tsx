import  { useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  keyframes,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const iconFloat = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const Login = () => {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
 

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Get the redirect path from location state or default to home
  // const from = (location.state as any)?.from?.pathname || '/';

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Navigation will be handled by the useEffect
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            animation: `${fadeIn} 0.6s ease-out`,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              mb: 3,
              animation: `${iconFloat} 3s ease-in-out infinite`,
              color: 'primary.main',
            }}
          >
            <RestaurantIcon sx={{ fontSize: 60 }} />
          </Box>

          <Typography
            component="h1"
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 'bold', color: 'primary.main' }}
          >
            Welcome to Zero Hunger
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4, maxWidth: 400 }}
          >
            "Every meal shared is a step towards ending hunger. Join us in making a difference."
          </Typography>

          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            sx={{
              py: 1.5,
              px: 4,
              backgroundColor: '#4285F4',
              '&:hover': {
                backgroundColor: '#357ABD',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.2s',
            }}
          >
            Continue with Google
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 