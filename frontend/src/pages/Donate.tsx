/**
 * Donate.tsx
 * Handles food donation submission with image upload and form validation
 */

import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

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

interface DonationForm {
  itemName: string;
  customItem: string;
  quantity: string;
  unit: string;
  expiryValue: string;
  expiryUnit: string;
  description: string;
  image: File | null;
}

const Donate = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<DonationForm>({
    itemName: '',
    customItem: '',
    quantity: '',
    unit: 'kg',
    expiryValue: '',
    expiryUnit: 'days',
    description: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!user) {
        throw new Error('You must be logged in to donate');
      }

      if (formData.itemName === 'Other' && !formData.customItem.trim()) {
        throw new Error('Please specify the food item name');
      }

      let imageUrl = '';
      if (formData.image) {
        try {
          // Validate file size (max 5MB)
          if (formData.image.size > 5 * 1024 * 1024) {
            throw new Error('Image size should be less than 5MB');
          }

          // Validate file type
          if (!formData.image.type.startsWith('image/')) {
            throw new Error('Please upload a valid image file');
          }

          // Create form data for Cloudinary upload
          const formDataToSend = new FormData();
          formDataToSend.append('file', formData.image);
          formDataToSend.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
          formDataToSend.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

          console.log('Starting image upload to Cloudinary...');
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: formDataToSend,
            }
          );

          if (!response.ok) {
            throw new Error('Failed to upload image to Cloudinary');
          }

          const data = await response.json();
          imageUrl = data.secure_url;
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError);
          setError(uploadError.message || 'Failed to upload image. Please try again or submit without an image.');
          return;
        }
      }

      const expiryDays = formData.expiryUnit === 'months' 
        ? parseInt(formData.expiryValue) * 30 
        : parseInt(formData.expiryValue);

      const donationData = {
        itemName: formData.itemName === 'Other' ? formData.customItem : formData.itemName,
        quantity: `${formData.quantity} ${formData.unit}`,
        expiryDays,
        description: formData.description,
        imageUrl,
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        status: 'pending',
      };

      console.log('Submitting donation data:', donationData);
      await addDoc(collection(db, 'donations'), donationData);
      setSuccess(true);
      setFormData({
        itemName: '',
        customItem: '',
        quantity: '',
        unit: 'kg',
        expiryValue: '',
        expiryUnit: 'days',
        description: '',
        image: null,
      });
    } catch (error: any) {
      console.error('Error submitting donation:', error);
      setError(error.message || 'Failed to submit donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Donate Food
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Help us reduce food waste and feed those in need
        </Typography>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
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

              <Grid item xs={12} sm={6}>
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

              <Grid item xs={12} sm={6}>
                <Grid container spacing={2}>
                  <Grid item xs={7}>
                    <TextField
                      required
                      fullWidth
                      label="Expires In"
                      name="expiryValue"
                      value={formData.expiryValue}
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
                        name="expiryUnit"
                        value={formData.expiryUnit}
                        onChange={handleInputChange}
                      >
                        <MenuItem value="days">Days</MenuItem>
                        <MenuItem value="months">Months</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
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
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ 
                    mb: 2,
                    py: 1.5,
                    borderColor: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                    }
                  }}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {formData.image && (
                  <Typography variant="body2" color="text.secondary">
                    Selected: {formData.image.name}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Donation submitted successfully!
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
                  {loading ? <CircularProgress size={24} /> : 'Submit Donation'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Donate; 