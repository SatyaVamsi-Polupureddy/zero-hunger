import { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

interface JoinUsForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  volunteerType: string;
  organization: string;
  description: string;
}

const JoinUs = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<JoinUsForm>({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    role: '',
    volunteerType: '',
    organization: '',
    description: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!user) {
        throw new Error('You must be logged in to join');
      }

      const submissionData = {
        ...formData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        status: 'pending',
      };

      await addDoc(collection(db, 'volunteers'), submissionData);
      setSuccess(true);
      setFormData({
        ...formData,
        phone: '',
        address: '',
        role: '',
        volunteerType: '',
        organization: '',
        description: '',
      });
    } catch (error: any) {
      console.error('Error submitting application:', error);
      setError(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Join Our Mission
        </Typography>
        <Typography variant="h6" align="center" gutterBottom sx={{ mb: 4, color: 'text.secondary' }}>
          Make a difference by becoming part of our community
        </Typography>

        <StyledPaper>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>I want to join as</InputLabel>
                  <Select
                    value={formData.role}
                    label="I want to join as"
                    name="role"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="volunteer">Volunteer</MenuItem>
                    <MenuItem value="delivery-agent">Delivery Agent</MenuItem>
                    <MenuItem value="ngo">NGO / Organization</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.role === 'volunteer' && (
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Volunteer Type</InputLabel>
                    <Select
                      value={formData.volunteerType}
                      label="Volunteer Type"
                      name="volunteerType"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="store">Store Manager</MenuItem>
                      <MenuItem value="coordinator">Food Drive Coordinator</MenuItem>
                      <MenuItem value="support">Support Staff</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {formData.role === 'delivery-agent' && (
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Vehicle Type</InputLabel>
                    <Select
                      value={formData.volunteerType}
                      label="Vehicle Type"
                      name="volunteerType"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="bike">Two Wheeler</MenuItem>
                      <MenuItem value="car">Four Wheeler</MenuItem>
                      <MenuItem value="van">Delivery Van</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="address"
                  label="Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>

              {formData.role === 'ngo' && (
                <Grid item xs={12}>
                  <TextField
                    name="organization"
                    label="Organization Name"
                    value={formData.organization}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Tell us about yourself"
                  value={formData.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Application submitted successfully! We'll contact you soon.
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Application'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </StyledPaper>
      </Box>
    </Container>
  );
};

export default JoinUs;
