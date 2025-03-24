import  { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
  useMediaQuery,
  Paper,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import PeopleIcon from '@mui/icons-material/People';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import GroupsIcon from '@mui/icons-material/Groups';

interface Stats {
  totalDonations: number;
  peopleHelped: number;
  activeVolunteers: number;
  ngosPartnered: number;
}

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalDonations: 0,
    peopleHelped: 0,
    activeVolunteers: 0,
    ngosPartnered: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const donationsSnapshot = await getDocs(collection(db, 'donations'));
        const volunteersSnapshot = await getDocs(collection(db, 'volunteers'));
        const ngosSnapshot = await getDocs(collection(db, 'ngos'));

        setStats({
          totalDonations: donationsSnapshot.size,
          peopleHelped: donationsSnapshot.size * 5,
          activeVolunteers: volunteersSnapshot.size,
          ngosPartnered: ngosSnapshot.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Donations',
      value: stats.totalDonations,
      icon: <LocalDiningIcon sx={{ fontSize: 40 }} />,
      color: '#2E7D32',
    },
    {
      title: 'People Helped',
      value: stats.peopleHelped,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976D2',
    },
    {
      title: 'Active Volunteers',
      value: stats.activeVolunteers,
      icon: <VolunteerActivismIcon sx={{ fontSize: 40 }} />,
      color: '#ED6C02',
    },
    {
      title: 'NGOs Partnered',
      value: stats.ngosPartnered,
      icon: <RestaurantIcon sx={{ fontSize: 40 }} />,
      color: '#9C27B0',
    },
  ];

  const features = [
    {
      title: 'Donate Surplus Food',
      description: 'Share your excess food with those who need it most. Every donation makes a difference.',
      icon: <FastfoodIcon />,
      action: () => navigate('/donate'),
      buttonText: 'Donate Now',
    },
    {
      title: 'Volunteer With Us',
      description: 'Join our network of dedicated volunteers and help us make a real impact in the community.',
      icon: <GroupsIcon />,
      action: () => navigate('/join-us'),
      buttonText: 'Join Us',
    },
    {
      title: 'Delivery Partners',
      description: 'Help us deliver food to those in need. Your vehicle and time can save lives.',
      icon: <DeliveryDiningIcon />,
      action: () => navigate('/join-us'),
      buttonText: 'Become a Partner',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography
              variant={isMobile ? 'h3' : 'h2'}
              component="h1"
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              Together We Can End Hunger
            </Typography>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              Join our mission to eliminate food waste and help those in need
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/donate')}
                sx={{
                  py: 1.5,
                  px: 4,
                
                  fontWeight: 'bold',
                  
                  '&:hover': {
                    borderWidth: 2,
                    
                    color:'white',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Donate Food
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => navigate('/join-us')}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontWeight: 'bold',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    color:'orange',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Become a Volunteer
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {statCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  },
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Box 
                    sx={{ 
                      color: card.color, 
                      mb: 2,
                      transform: 'scale(1)',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
                    {card.value.toLocaleString()}
                  </Typography>
                  <Typography 
                    color="text.secondary"
                    sx={{ fontSize: '1.1rem' }}
                  >
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 6,
            }}
          >
            How You Can Help
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    },
                    borderRadius: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'primary.main',
                      mb: 3,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ mb: 3, flexGrow: 1 }}
                  >
                    {feature.description}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={feature.action}
                    sx={{
                      py: 1,
                      px: 3,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    {feature.buttonText}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 