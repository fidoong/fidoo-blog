import { apiClient } from './client';
import type { User, PaginatedResponse, UserQueryParams } from './types';

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
  getUsers: async (params?: UserQueryParams): Promise<PaginatedResponse<User>> => {
    return apiClient.get<PaginatedResponse<User>>('/users', { params });
  },

  getUser: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  createUser: async (data: CreateUserDto): Promise<User> => {
    return apiClient.post<User>('/users', data);
  },

  updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
    return apiClient.post<User>(`/users/${id}/update`, data);
  },

  deleteUser: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/users/${id}/delete`);
  },
};

