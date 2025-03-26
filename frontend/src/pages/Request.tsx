/**
 * Request.tsx
 * This component handles the food request functionality where users can request food from available donations.
 * It includes features like searching donations, filtering by status, and submitting new requests.
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Chip,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

interface RequestForm {
  itemName: string;
  quantity: string;
  unit: string;
  description: string;
  urgency: string;
  customItem: string;
}

interface Donation {
  id: string;
  itemName: string;
  quantity: string;
  description: string;
  imageUrl: string;
  expiryDays: string;
  createdAt: Date;
  status: string;
  userName: string;
}

const commonFoodItems = [
  'Rice',
  'Wheat Flour',
  'Pulses',
  'Cooking Oil',
  'Sugar',
  'Salt',
  'Milk',
  'Bread',
  'Vegetables',
  'Fruits',
  'Other'
];

/**
 * Request Component
 * Main component for handling food requests
 */
const Request: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<RequestForm>({
    itemName: '',
    quantity: '',
    unit: 'kg',
    description: '',
    urgency: 'medium',
    customItem: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Fetches available donations from Firestore
   * Filters donations based on status and sorts by creation date
   */
  useEffect(() => {
    fetchAvailableDonations();
  }, []);

  const fetchAvailableDonations = async () => {
    try {
      // First get all pending donations
      const q = query(
        collection(db, 'donations'),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      const donations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Donation[];
      
      // Sort in memory temporarily until the index is ready
      donations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setAvailableDonations(donations);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handles search functionality for donations
   * Filters donations based on search term
   */
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchQuery(searchTerm);
    const filtered = availableDonations.filter(donation => 
      donation.itemName.toLowerCase().includes(searchTerm) ||
      donation.description.toLowerCase().includes(searchTerm)
    );
    setAvailableDonations(filtered);
  };

  /**
   * Handles filter changes for donations
   * Filters donations based on selected criteria
   */
  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    const filtered = availableDonations.filter(donation => {
      if (value === 'expiring') {
        return donation.expiryDays <= '7';
      } else if (value === 'newest') {
        return true; // Assuming you want to keep all donations if filtering by newest
      }
      return true; // Keep all donations if no filter is applied
    });
    setAvailableDonations(filtered);
  };

  /**
   * Handles the submission of a new request
   * Creates a new request document in Firestore
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!user) {
      setError('You must be logged in to submit a request');
      return;
    }

    // Validate form
    if (formData.itemName === '') {
      setError('Please select an item');
      return;
    }

    if (formData.itemName === 'Other' && formData.customItem.trim() === '') {
      setError('Please specify the item name');
      return;
    }

    if (formData.quantity === '' || parseFloat(formData.quantity) < 1) {
      setError('Please enter a valid quantity (minimum 1)');
      return;
    }

    try {
      setLoading(true);
      const requestsRef = collection(db, 'requests');
      
      await addDoc(requestsRef, {
        itemName: formData.itemName === 'Other' ? formData.customItem : formData.itemName,
        quantity: formData.quantity,
        unit: formData.unit,
        description: formData.description,
        urgency: formData.urgency,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      setSuccess(true);
      setFormData({
        itemName: '',
        quantity: '',
        unit: 'kg',
        description: '',
        urgency: 'medium',
        customItem: '',
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = (donation: Donation) => {
    const [, unit] = donation.quantity.split(' '); // Only get the unit from the donation
    setFormData({
      itemName: donation.itemName,
      quantity: '1', // Always set to 1
      unit: unit, // Keep the same unit from the donation
      description: '', // Leave description empty
      urgency: 'medium',
      customItem: '',
    });
  };

  // Filter donations based on search query
  const filteredDonations = availableDonations.filter(donation => {
    const searchLower = searchQuery.toLowerCase();
    return (
      donation.itemName.toLowerCase().includes(searchLower) ||
      donation.description.toLowerCase().includes(searchLower) ||
      donation.quantity.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Request Food
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Submit your food request or browse available donations
        </Typography>

        <Grid container spacing={4}>
          {/* Request Form */}
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Submit Request
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Item Name</InputLabel>
                      <Select
                        label="Item Name"
                        name="itemName"
                        value={formData.itemName}
                        onChange={handleInputChange}
                      >
                        {commonFoodItems.map((item) => (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
   {/* foot */}
                  {formData.itemName === 'Other' && (
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Specify Item"
                        name="customItem"
                        value={formData.customItem}
                        onChange={handleInputChange}
                        variant="outlined"
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={7}>
                        <TextField
                          required
                          fullWidth
                          label="Quantity"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          type="number"
                          inputProps={{ min: 1 }}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Unit</InputLabel>
                          <Select
                            label="Unit"
                            name="unit"
                            value={formData.unit}
                            onChange={handleInputChange}
                          >
                            <MenuItem value="kg">Kilograms (kg)</MenuItem>
                            <MenuItem value="g">Grams (g)</MenuItem>
                            <MenuItem value="l">Liters (L)</MenuItem>
                            <MenuItem value="ml">Milliliters (mL)</MenuItem>
                            <MenuItem value="pcs">Pieces (pcs)</MenuItem>
                            <MenuItem value="boxes">Boxes</MenuItem>
                            <MenuItem value="packets">Packets</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Urgency Level</InputLabel>
                      <Select
                        label="Urgency Level"
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleInputChange}
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
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
                        Request submitted successfully!
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
                        }
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Submit Request'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          {/* Available Donations */}
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                  Available Donations
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search donations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: 250 }}
                />
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : filteredDonations.length === 0 ? (
                <Alert severity="info">
                  {searchQuery 
                    ? 'No donations found matching your search.'
                    : 'No donations available at the moment.'}
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {filteredDonations.map((donation) => (
                    <Paper
                      key={donation.id}
                      elevation={1}
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        alignItems: { xs: 'center', sm: 'flex-start' },
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      {donation.imageUrl && (
                        <Box
                          component="img"
                          src={donation.imageUrl}
                          alt={donation.itemName}
                          sx={{
                            width: { xs: '100%', sm: 100 },
                            height: { xs: 200, sm: 100 },
                            objectFit: 'cover',
                            borderRadius: 1,
                            mb: { xs: 2, sm: 0 },
                          }}
                        />
                      )}
                      <Box sx={{ flex: 1, width: '100%', textAlign: { xs: 'center', sm: 'left' } }}>
                        <Typography variant="h6" gutterBottom>
                          {donation.itemName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Quantity: {donation.quantity}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Expires in: {donation.expiryDays} days
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {donation.description}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleRequest(donation)}
                        disabled={loading}
                        sx={{ 
                          mt: { xs: 2, sm: 0 },
                          width: { xs: '100%', sm: 'auto' }
                        }}
                      >
                        Request
                      </Button>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Request; 