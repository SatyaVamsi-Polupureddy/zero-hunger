import { Donation, Request, NGO, Volunteer } from '../types';

export const dummyNgos: NGO[] = [
  {
    id: '1',
    name: 'Food Bank India',
    address: '123 Main Street, Mumbai',
    contact: '+91 9876543210',
    location: {
      lat: 19.0760,
      lng: 72.8777
    },
    capacity: 1000,
    currentStock: 750
  },
  {
    id: '2',
    name: 'Feed the Hungry',
    address: '456 Park Avenue, Delhi',
    contact: '+91 9876543211',
    location: {
      lat: 28.6139,
      lng: 77.2090
    },
    capacity: 800,
    currentStock: 600
  },
  {
    id: '3',
    name: 'Share Food Foundation',
    address: '789 Beach Road, Chennai',
    contact: '+91 9876543212',
    location: {
      lat: 13.0827,
      lng: 80.2707
    },
    capacity: 1200,
    currentStock: 900
  }
];

export const dummyDonations: Donation[] = [
  {
    id: '1',
    itemName: 'Rice',
    quantity: '10kg',
    description: 'Fresh Basmati rice',
    imageUrl: 'https://example.com/rice.jpg',
    expiryDays: '30',
    createdAt: new Date(),
    status: 'pending',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    location: {
      lat: 19.0760,
      lng: 72.8777
    }
  },
  {
    id: '2',
    itemName: 'Vegetables',
    quantity: '5kg',
    description: 'Fresh vegetables assortment',
    imageUrl: 'https://example.com/vegetables.jpg',
    expiryDays: '3',
    createdAt: new Date(),
    status: 'pending',
    userId: 'user2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    location: {
      lat: 28.6139,
      lng: 77.2090
    }
  }
];

export const dummyRequests: Request[] = [
  {
    id: '1',
    itemName: 'Rice',
    quantity: '5kg',
    description: 'Need rice for family of 4',
    urgency: 'high',
    createdAt: new Date(),
    status: 'pending',
    userId: 'user3',
    userName: 'Alice Johnson',
    userEmail: 'alice@example.com',
    location: {
      lat: 13.0827,
      lng: 80.2707
    }
  },
  {
    id: '2',
    itemName: 'Vegetables',
    quantity: '2kg',
    description: 'Need vegetables for elderly couple',
    urgency: 'medium',
    createdAt: new Date(),
    status: 'pending',
    userId: 'user4',
    userName: 'Bob Wilson',
    userEmail: 'bob@example.com',
    location: {
      lat: 19.0760,
      lng: 72.8777
    }
  }
];

export const dummyVolunteers: Volunteer[] = [
  {
    id: '1',
    name: 'Mike Brown',
    phone: '+91 9876543213',
    address: '321 Oak Street, Mumbai',
    role: 'delivery',
    availability: 'weekends',
    vehicleType: 'car',
    maxDistance: '5',
    createdAt: new Date(),
    status: 'active',
    userId: 'user5',
    userEmail: 'mike@example.com',
    location: {
      lat: 19.0760,
      lng: 72.8777
    }
  },
  {
    id: '2',
    name: 'Sarah Davis',
    phone: '+91 9876543214',
    address: '654 Pine Street, Delhi',
    role: 'storage',
    availability: 'weekdays',
    vehicleType: 'van',
    maxDistance: '10',
    createdAt: new Date(),
    status: 'active',
    userId: 'user6',
    userEmail: 'sarah@example.com',
    location: {
      lat: 28.6139,
      lng: 77.2090
    }
  }
]; 