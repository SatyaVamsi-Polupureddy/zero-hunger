import express from 'express';
import { dummyNgos, dummyDonations, dummyRequests, dummyVolunteers } from '../services/dummyData';

const router = express.Router();

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Add delay to all routes in development
router.use(async (_req, _res, next) => {
  await delay(500); // 500ms delay
  next();
});

// Get all NGOs
router.get('/ngos', (_req, res) => {
  return res.json(dummyNgos);
});

// Get all donations
router.get('/donations', (_req, res) => {
  return res.json(dummyDonations);
});

// Get all requests
router.get('/requests', (_req, res) => {
  return res.json(dummyRequests);
});

// Get all volunteers
router.get('/volunteers', (_req, res) => {
  return res.json(dummyVolunteers);
});

// Get NGO by ID
router.get('/ngos/:id', (req, res) => {
  const ngo = dummyNgos.find(n => n.id === req.params.id);
  if (!ngo) {
    return res.status(404).json({ error: 'NGO not found' });
  }
  return res.json(ngo);
});

// Get donation by ID
router.get('/donations/:id', (req, res) => {
  const donation = dummyDonations.find(d => d.id === req.params.id);
  if (!donation) {
    return res.status(404).json({ error: 'Donation not found' });
  }
  return res.json(donation);
});

// Get request by ID
router.get('/requests/:id', (req, res) => {
  const request = dummyRequests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  return res.json(request);
});

// Get volunteer by ID
router.get('/volunteers/:id', (req, res) => {
  const volunteer = dummyVolunteers.find(v => v.id === req.params.id);
  if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  return res.json(volunteer);
});

export default router; 