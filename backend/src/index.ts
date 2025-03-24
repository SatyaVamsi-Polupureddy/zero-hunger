import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import apiRoutes from './routes/api';
import devRoutes from './routes/dev';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin only if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Development routes (only in development mode)
if (process.env.NODE_ENV !== 'production') {
  app.use('/dev', devRoutes);
}

// Basic route
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Zero Hunger API' });
});

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);

// Start the server if running locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Development routes available at /dev/*');
  });
}
