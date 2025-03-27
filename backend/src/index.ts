/**
 * index.ts
 * Main backend server entry point with Express setup and route configuration
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import apiRoutes from './routes/api';
import devRoutes from './routes/dev';
import chatbotRoutes from './routes/chatbot';

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
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Development routes (only in development mode)
if (process.env.NODE_ENV !== 'production') {
  app.use('/dev', devRoutes);
}

// Basic route
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Zero Hunger API' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);

// Start the server if running locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Development routes available at /dev/*');
    console.log('Chatbot API available at /api/chatbot/chat');
  });
}
