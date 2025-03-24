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

const Request = () => {
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

  useEffect(() => {
    fetchAvailableDonations();
  }, []);

  const fetchAvailableDonations = async () => {
    try {
      const q = query(
        collection(db, 'donations'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const donations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Donation[];
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

    if (formData.quantity === '' || parseFloat(formData.quantity) <= 0) {
      setError('Please enter a valid quantity');
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Request Food
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Submit your food request or browse available donations
        </Typography>

        <Grid container spacing={4}>
          {/* Request Form */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
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
                          inputProps={{ min: 0 }}
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
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Available Donations
            </Typography>
            <Grid container spacing={2}>
              {availableDonations.map((donation) => (
                <Grid item xs={12} key={donation.id}>
                  <Card>
                    {donation.imageUrl && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={donation.imageUrl}
                        alt={donation.itemName}
                      />
                    )}
                    <CardContent>
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
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={`Donated by ${donation.userName}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Request; 