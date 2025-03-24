import axios from 'axios';
import { Donation, Request, NGO, Volunteer } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// NGO Services
export const ngoService = {
  getAll: () => api.get<NGO[]>('/dev/ngos'),
  getById: (id: string) => api.get<NGO>(`/dev/ngos/${id}`),
  getNearby: (lat: number, lng: number, radius: number = 5) =>
    api.get<NGO[]>('/api/ngos/nearby', { params: { lat, lng, radius } }),
};

// Donation Services
export const donationService = {
  getAll: () => api.get<Donation[]>('/dev/donations'),
  getById: (id: string) => api.get<Donation>(`/dev/donations/${id}`),
  create: (data: Omit<Donation, 'id'>) => api.post<Donation>('/api/donations', data),
  matchFood: (donationId: string) => api.post('/api/match-food', { donationId }),
  updateStatus: (id: string, status: string) =>
    api.patch(`/api/donations/${id}`, { status }),
};

// Request Services
export const requestService = {
  getAll: () => api.get<Request[]>('/dev/requests'),
  getById: (id: string) => api.get<Request>(`/dev/requests/${id}`),
  create: (data: Omit<Request, 'id'>) => api.post<Request>('/api/requests', data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/api/requests/${id}`, { status }),
};

// Volunteer Services
export const volunteerService = {
  getAll: () => api.get<Volunteer[]>('/dev/volunteers'),
  getById: (id: string) => api.get<Volunteer>(`/dev/volunteers/${id}`),
  create: (data: Omit<Volunteer, 'id'>) => api.post<Volunteer>('/api/volunteers', data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/api/volunteers/${id}`, { status }),
};

export default api; 