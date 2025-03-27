import { VertexAI } from '@google-cloud/vertexai';
import { Donation, Request, Match } from '../types';

const vertex = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT || '',
  location: process.env.GOOGLE_CLOUD_LOCATION || '',
});

const model = vertex.preview.getGenerativeModel({
  model: 'gemini-pro',
});

export const matchFood = async (
  donation: Donation,
  requests: Request[]
): Promise<Match[]> => {
  try {
    const prompt = `
      Analyze the following food donation and requests to find the best matches.
      Consider factors like:
      1. Food type compatibility
      2. Quantity requirements
      3. Urgency level
      4. Expiry time
      
      Donation:
      - Item: ${donation.itemName}
      - Quantity: ${donation.quantity}
      - Description: ${donation.description}
      - Expires in: ${donation.expiryDays} days
      
      Requests:
      ${requests.map(
        (req) => `
      - Item: ${req.itemName}
      - Quantity: ${req.quantity}
      - Description: ${req.description}
      - Urgency: ${req.urgency}
      `
      )}
      
      Provide a JSON array of matches with scores (0-1) and reasons.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.candidates[0]?.content?.parts[0]?.text;
    
    if (!responseText) {
      throw new Error('No response text received from Vertex AI');
    }

    const matches = JSON.parse(responseText);

    return matches.map((match: any) => ({
      donationId: donation.id,
      requestId: match.requestId,
      status: 'pending',
      createdAt: new Date(),
      matchedBy: 'ai',
      distance: 0, // Will be calculated separately
      score: match.score,
    }));
  } catch (error) {
    console.error('Error matching food:', error);
    throw error;
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}; 