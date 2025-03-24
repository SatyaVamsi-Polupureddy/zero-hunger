import express from 'express';
import { db } from '../config/firebase';
import { matchFood, calculateDistance } from '../services/foodMatching';
import { NGO, Donation, Request } from '../types';
import { dummyNgos, dummyDonations, dummyRequests } from '../services/dummyData';

const router = express.Router();

// Get nearby NGOs
router.get('/ngos/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Use dummy data in development
    if (process.env.NODE_ENV !== 'production') {
      const nearbyNgos = dummyNgos.filter(ngo => {
        const distance = calculateDistance(
          Number(lat),
          Number(lng),
          ngo.location.lat,
          ngo.location.lng
        );
        return distance <= Number(radius);
      });
      return res.json(nearbyNgos);
    }

    // Production code
    const ngosSnapshot = await db.collection('ngos').get();
    const ngos = ngosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as NGO[];

    const nearbyNgos = ngos.filter(ngo => {
      const distance = calculateDistance(
        Number(lat),
        Number(lng),
        ngo.location.lat,
        ngo.location.lng
      );
      return distance <= Number(radius);
    });

    return res.json(nearbyNgos);
  } catch (error) {
    console.error('Error fetching nearby NGOs:', error);
    return res.status(500).json({ error: 'Failed to fetch nearby NGOs' });
  }
});

// Match food donations with requests
router.post('/match-food', async (req, res) => {
  try {
    const { donationId } = req.body;

    if (!donationId) {
      return res.status(400).json({ error: 'Donation ID is required' });
    }

    // Use dummy data in development
    if (process.env.NODE_ENV !== 'production') {
      const donation = dummyDonations.find(d => d.id === donationId);
      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      const matches = await matchFood(donation, dummyRequests);
      return res.json(matches);
    }

    // Production code
    const donationDoc = await db.collection('donations').doc(donationId).get();
    if (!donationDoc.exists) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const donation = { id: donationDoc.id, ...donationDoc.data() } as Donation;

    const requestsSnapshot = await db.collection('requests')
      .where('status', '==', 'pending')
      .get();
    
    const requests = requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Request[];

    const matches = await matchFood(donation, requests);

    const matchPromises = matches.map(match =>
      db.collection('matches').add(match)
    );
    await Promise.all(matchPromises);

    return res.json(matches);
  } catch (error) {
    console.error('Error matching food:', error);
    return res.status(500).json({ error: 'Failed to match food' });
  }
});

// Update match status
router.patch('/matches/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // In development, just return success
    if (process.env.NODE_ENV !== 'production') {
      return res.json({ message: 'Match status updated successfully' });
    }

    // Production code
    await db.collection('matches').doc(matchId).update({ status });

    return res.json({ message: 'Match status updated successfully' });
  } catch (error) {
    console.error('Error updating match status:', error);
    return res.status(500).json({ error: 'Failed to update match status' });
  }
});

export default router; 