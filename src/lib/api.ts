import axios from 'axios';

// Configuration de l'API backend YENGOU
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Instance axios configurée
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré, rediriger vers login
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Types pour l'API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Service de base pour les opérations CRUD
export class BaseApiService<T> {
  constructor(private endpoint: string) {}

  async getAll(params?: any): Promise<T[]> {
    const response = await apiClient.get(this.endpoint, { params });
    return response.data;
  }

  async getAllPaginated(page = 0, size = 20, params?: any): Promise<PaginatedResponse<T>> {
    const response = await apiClient.get(this.endpoint, {
      params: { page, size, ...params }
    });
    return response.data;
  }

  async getById(id: string | number): Promise<T> {
    const response = await apiClient.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await apiClient.post(this.endpoint, data);
    return response.data;
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    const response = await apiClient.put(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  async search(query: string, params?: any): Promise<T[]> {
    const response = await apiClient.get(`${this.endpoint}/_search`, {
      params: { query, ...params }
    });
    return response.data;
  }
}