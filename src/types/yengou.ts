// YENGOU - Types et interfaces pour l'application VTC Sénégal

export interface AdminMetrics {
  activeTrips: number;
  onlineDrivers: number;
  dailyRevenue: number;
  userSatisfaction: number;
}

export interface TripLocation {
  id: string;
  lat: number;
  lng: number;
  status: 'active' | 'waiting' | 'completed';
  driverId: string;
  customerId: string;
  destination?: string;
}

export interface DriverLocation {
  driverId: string;
  name: string;
  lat: number;
  lng: number;
  status: 'available' | 'busy' | 'offline';
  vehicleType: string;
  rating: number;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customerId: string;
  customerName: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  category: 'technical' | 'billing' | 'driver_issue' | 'general';
}

export interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  resolvedToday: number;
}

export interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  agentId?: string;
  agentName?: string;
  status: 'waiting' | 'active' | 'resolved';
  messages: ChatMessage[];
  startedAt: Date;
  lastActivity: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
}

export interface DriverProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    plateNumber: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  rating: number;
  totalTrips: number;
  joinedAt: Date;
  documents: Document[];
}

export interface Document {
  id: string;
  type: 'license' | 'insurance' | 'vehicle_registration' | 'identity';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
}

export interface Trip {
  id: string;
  customerId: string;
  customerName: string;
  driverId: string;
  driverName: string;
  origin: string;
  destination: string;
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  fare: number;
  distance: number;
  duration: number;
  createdAt: Date;
  completedAt?: Date;
}

export type UserRole = 'ROLE_ADMIN' | 'ROLE_SUPPORT' | 'ROLE_USER';

export interface User {
  id: string;
  username: string;
  email: string;
  roles: UserRole[];
  isActive: boolean;
}