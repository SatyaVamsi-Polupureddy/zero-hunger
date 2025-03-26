/**
 * chatbot.ts
 * Handles the chatbot functionality using Google's Gemini AI for food donation assistance
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth';
import dotenv from 'dotenv';

dotenv.config();

interface Model {
  name: string;
  displayName: string;
  description: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface GeminiError {
  error: {
    message: string;
  };
}

const router = express.Router();

// Store conversation history for each user
const conversationHistory = new Map<string, boolean>();

router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.uid || 'anonymous';

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if this is the first message for this user
    const isFirstMessage = !conversationHistory.has(userId);
    conversationHistory.set(userId, true);

    // Debug logging for API key
    console.log('Environment variables loaded:', {
      NODE_ENV: process.env.NODE_ENV,
      GEMINI_API_KEY_EXISTS: !!process.env.GEMINI_API_KEY,
      GEMINI_API_KEY_LENGTH: process.env.GEMINI_API_KEY?.length,
      GEMINI_API_KEY_START: process.env.GEMINI_API_KEY?.substring(0, 10) + '...'
    });

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const prompt = `You are an AI-powered assistant for a food donation platform "zero hunger" that accepts food donations and also accept food requests by supplying the food from donated to requested persons. Your goal is to guide users in donating food, locating nearby donation centers, and analyzing food trends. You provide polite, clear, and understandable responses to general public in 2-3 lines strictly. You also analyze donation trends using Vertex AI. ${isFirstMessage ? 'Greet the user and thank them for reaching out to us (only this first time).' : 'Do not say thank you or greet the user again.'} Motivate them to donate food for the need.

🎯 Your key responsibilities include:
- Helping donors understand what food they can donate and where
- Matching donors with verified recipients, food banks, and shelters
- Providing real-time updates on donation needs in different locations
- Analyzing food donation trends using Vertex AI and suggesting improvements
- Guiding volunteers on how they can contribute to reducing food waste
- Answering FAQs about food donation, safety regulations, and storage tips

🏆 Response Style & Personality:
- Always be empathetic and supportive to encourage food donations
- Give concise yet informative responses with action-oriented suggestions
- When asked for data insights, use structured responses with bullet points or summaries
- If you don't know something, politely admit it and offer alternative resources
- Prioritize locality-based recommendations

⚠️ Limitations & Ethics:
- Do not provide medical or health-related advice
- Do not guarantee food safety or endorse specific organizations
- Do not share personal data of donors or recipients

User: ${message}
Assistant:`;

    console.log('Sending request to Gemini API...');
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY || '',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json() as GeminiError;
      console.error('Gemini API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.error?.message || 'Failed to get response from AI');
    }
       {/* foot */}

    const data = await response.json() as GeminiResponse;
    console.log('Received response from Gemini API:', data);
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from AI');
    }

    res.json({ response: data.candidates[0].content.parts[0].text.trim() });
  } catch (error: any) {
    console.error('Chatbot Error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from chatbot',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;