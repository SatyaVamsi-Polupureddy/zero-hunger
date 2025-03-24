export interface Donation {
  id: string;
  itemName: string;
  quantity: string;
  description: string;
  imageUrl: string;
  expiryDays: string;
  createdAt: Date;
  status: string;
  userId: string;
  userName: string;
  userEmail: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Request {
  id: string;
  itemName: string;
  quantity: string;
  description: string;
  urgency: string;
  createdAt: Date;
  status: string;
  userId: string;
  userName: string;
  userEmail: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface NGO {
  id: string;
  name: string;
  address: string;
  contact: string;
  location: {
    lat: number;
    lng: number;
  };
  capacity: number;
  currentStock: number;
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  address: string;
  role: string;
  availability: string;
  vehicleType: string;
  maxDistance: string;
  createdAt: Date;
  status: string;
  userId: string;
  userEmail: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Match {
  donationId: string;
  requestId: string;
  ngoId?: string;
  status: string;
  createdAt: Date;
  matchedBy: string;
  distance: number;
  score: number;
} 