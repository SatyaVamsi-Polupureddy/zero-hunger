import { Box, Container, Typography, Grid, IconButton, Tooltip } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        background: 'linear-gradient(180deg, #1a1a1a 0%, #000000 100%)',
        color: 'white',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #2E7D32, #FFA000, #2E7D32)',
          backgroundSize: '200% 100%',
          animation: 'gradient 3s linear infinite',
        }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <RestaurantIcon sx={{ 
                color: '#2E7D32', 
                fontSize: 24,
                animation: 'colorChange 3s infinite',
              }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #2E7D32, #FFA000, #2E7D32)',
                  backgroundSize: '200% 100%',
                  animation: 'gradient 3s linear infinite',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Team Fullstack Foodies
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
              <Tooltip title="GitHub">
                <IconButton 
                  size="small"
                  component="a"
                  href="https://github.com/dheerajwe/zero-hunger-main"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      color: '#2E7D32',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    }
                  }}
                >
                  <GitHubIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Instagram">
                <IconButton 
                  size="small"
                  component="a"
                  href="https://instagram.com/___.d_h_e_e_r_a_j.___"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      color: '#FFA000',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    }
                  }}
                >
                  <InstagramIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Email">
                <IconButton 
                  size="small"
                  component="a"
                  href="mailto:dheerajmande@gmail.com"
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      color: '#2E7D32',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    }
                  }}
                >
                  <EmailIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12}>
            {/* <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              {['Dheeraj', 'Vamsi', 'Bhanu', 'Sudheer'].map((name, index) => (
                <Typography 
                  key={name}
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': {
                      color: '#2E7D32',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease',
                    },
                    '&:not(:last-child)::after': {
                      content: '"•"',
                      margin: '0 0.5rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }
                  }}
                >
                  {name}
                </Typography>
              ))}
            </Box> */}
          </Grid>
          <Grid item xs={12}>
            <Typography 
              variant="caption" 
              align="center" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                display: 'block',
                fontStyle: 'italic',
              }}
            >
              © {new Date().getFullYear()} Zero Hunger | Together We Can End Hunger
            </Typography>
          </Grid>
        </Grid>
      </Container>
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes colorChange {
            0% { color: #2E7D32; }
            50% { color: #FFA000; }
            100% { color: #2E7D32; }
          }
        `}
      </style>
    </Box>
  );
};

export default Footer; 