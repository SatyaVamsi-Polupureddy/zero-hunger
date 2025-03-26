import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      {/* foot */}
      <Container maxWidth="sm">
        <Typography variant="body2" color="text.secondary" align="center">
          {'By team '}
          <Link
            color="inherit"
            href="https://github.com/your-team"
            target="_blank"
            rel="noopener noreferrer"
          >
            Fullstack Foodies
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};


export default Footer; 