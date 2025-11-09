import { apiClient } from './client';
import type { Tag, CreateTagDto } from './types';

export interface UpdateTagDto {
  name?: string;
  slug?: string;
  color?: string;
  categoryId?: string | null;
}

export const tagsApi = {
  getTags: async (): Promise<Tag[]> => {
    return apiClient.get<Tag[]>('/tags');
  },

  getTag: async (id: string): Promise<Tag> => {
    return apiClient.get<Tag>(`/tags/${id}`);
  },

  createTag: async (data: CreateTagDto): Promise<Tag> => {
    return apiClient.post<Tag>('/tags', data);
  },

  updateTag: async (id: string, data: UpdateTagDto): Promise<Tag> => {
    return apiClient.post<Tag>(`/tags/${id}/update`, data);
  },

  deleteTag: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/tags/${id}/delete`);
  },
};

