import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText,
  Box,
  useTheme,
  
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Fade,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      handleMenuClose();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    { text: 'Home', path: '/' },
    { text: 'Donate', path: '/donate' },
    { text: 'Request', path: '/request' },
    { text: 'Join Us', path: '/join-us' },
  ];

  const [isVolunteer, setIsVolunteer] = useState(false);

  useEffect(() => {
    const checkVolunteerStatus = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'volunteers'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        setIsVolunteer(!querySnapshot.empty);
      } catch (error) {
        console.error('Error checking volunteer status:', error);
      }
    };

    checkVolunteerStatus();
  }, [user]);

  if (!user || location.pathname === '/login') {
    return null;
  }

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem 
          button 
          key={item.text} 
          onClick={() => {
            navigate(item.path);
            setMobileOpen(false);
          }}
          sx={{
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemText 
            primary={item.text}
            primaryTypographyProps={{
              color: location.pathname === item.path ? 'primary' : 'textPrimary',
              fontWeight: location.pathname === item.path ? 600 : 400,
            }}
          />
        </ListItem>
      ))}
      {isVolunteer && (
        <ListItem 
          button 
          onClick={() => {
            navigate('/volunteer-dashboard');
            setMobileOpen(false);
          }}
          sx={{
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemText 
            primary="Volunteer Dashboard"
            primaryTypographyProps={{
              color: location.pathname === '/volunteer-dashboard' ? 'primary' : 'textPrimary',
              fontWeight: location.pathname === '/volunteer-dashboard' ? 600 : 400,
            }}
          />
        </ListItem>
      )}
    </List>
  );

  return (
    <AppBar 
      position="sticky" 
      color="default" 
      elevation={1}
      sx={{
        backdropFilter: 'blur(8px)',
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(18, 18, 18, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
          onClick={() => navigate('/')}
        >
          Zero Hunger
        </Typography>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.text}
                color="inherit"
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    width: isActive ? '100%' : '0%',
                    height: '2px',
                    backgroundColor: theme.palette.primary.main,
                    transition: 'all 0.3s ease',
                    transform: 'translateX(-50%)',
                  },
                  '&:hover::after': {
                    width: isActive ? '100%' : '100%',
                  },
                  color: isActive ? 'primary' : 'textPrimary',
                  fontWeight: isActive ? 600 : 400,
                  '&:hover': {
                    backgroundColor: isActive 
                      ? 'transparent' 
                      : theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                {item.text}
              </Button>
            );
          })}
          {isVolunteer && (
            <Button
              color="inherit"
              onClick={() => navigate('/volunteer-dashboard')}
              sx={{
                mx: 1,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  width: location.pathname === '/volunteer-dashboard' ? '100%' : '0%',
                  height: '2px',
                  backgroundColor: theme.palette.primary.main,
                  transition: 'all 0.3s ease',
                  transform: 'translateX(-50%)',
                },
                '&:hover::after': {
                  width: location.pathname === '/volunteer-dashboard' ? '100%' : '100%',
                },
                color: location.pathname === '/volunteer-dashboard' ? 'primary' : 'textPrimary',
                fontWeight: location.pathname === '/volunteer-dashboard' ? 600 : 400,
                '&:hover': {
                  backgroundColor: location.pathname === '/volunteer-dashboard'
                    ? 'transparent'
                    : theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              Volunteer Dashboard
            </Button>
          )}
        </Box>

        <Tooltip title="Toggle theme" TransitionComponent={Fade}>
          <IconButton
            onClick={toggleTheme}
            sx={{ 
              mx: 1,
              color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Profile" TransitionComponent={Fade}>
          <IconButton
            onClick={handleMenuOpen}
            sx={{ 
              ml: 1,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: theme.palette.success.main,
                  color: theme.palette.success.main,
                  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                  '&::after': {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    animation: 'ripple 1.2s infinite ease-in-out',
                    border: '1px solid currentColor',
                    content: '""',
                  },
                },
              }}
            >
              <Avatar
                alt={user.displayName || ''}
                src={user.photoURL || ''}
                sx={{ 
                  width: 32, 
                  height: 32,
                  border: `2px solid ${theme.palette.primary.main}`,
                }}
              />
            </Badge>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          TransitionComponent={Fade}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 180,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 4px 20px rgba(0,0,0,0.3)'
                : '0 4px 20px rgba(0,0,0,0.1)',
            },
          }}
        >
          <MenuItem 
            onClick={handleLogout}
            sx={{
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 240,
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ 
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar; 