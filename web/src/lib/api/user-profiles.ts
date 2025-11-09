import { apiClient } from './client';

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
  getProfile: async (userId?: string): Promise<UserProfile> => {
    return apiClient.get<UserProfile>('/user-profiles', {
      params: userId ? { userId } : {},
    });
  },

  // 更新用户资料
  updateProfile: async (data: UpdateUserProfileDto): Promise<UserProfile> => {
    return apiClient.post<UserProfile>('/user-profiles/update', data);
  },
};
