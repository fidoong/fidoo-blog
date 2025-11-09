import { apiClient } from './client';
import type { ApiResponse, User, PaginatedResponse, UserQueryParams } from './types';

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  role?: 'admin' | 'editor' | 'user';
}

export interface UpdateUserDto {
  nickname?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  role?: 'admin' | 'editor' | 'user';
  status?: 'active' | 'inactive' | 'banned';
}

export const usersApi = {
  getUsers: async (params?: UserQueryParams): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  getUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserDto): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserDto): Promise<ApiResponse<User>> => {
    const response = await apiClient.post(`/users/${id}/update`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/users/${id}/delete`);
    return response.data;
  },
};

