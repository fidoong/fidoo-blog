import { apiClient } from './client';
import type { ApiResponse } from './types';

export interface UserProfile {
  id: string;
  userId: string;
  bio: string | null;
  avatar: string | null;
  location: string | null;
  website: string | null;
  github: string | null;
  twitter: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileDto {
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  github?: string;
  twitter?: string;
}

export const userProfilesApi = {
  // 获取用户资料
  getProfile: async (userId?: string): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get('/user-profiles', {
      params: userId ? { userId } : {},
    });
    return response.data;
  },

  // 更新用户资料
  updateProfile: async (data: UpdateUserProfileDto): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.post('/user-profiles/update', data);
    return response.data;
  },
};
