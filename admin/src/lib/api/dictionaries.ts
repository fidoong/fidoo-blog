import { apiClient } from './client';

export interface Dictionary {
  id: string;
  name: string;
  code: string;
  type: 'tree' | 'dict';
  parentId: string | null;
  parent?: Dictionary | null;
  children?: Dictionary[];
  label: string | null;
  value: string | null;
  extra: Record<string, any> | null;
  sortOrder: number;
  status: 'enabled' | 'disabled';
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDictionaryDto {
  name: string;
  code: string;
  type?: 'tree' | 'dict';
  parentId?: string;
  label?: string;
  value?: string;
  extra?: Record<string, any>;
  sortOrder?: number;
  status?: 'enabled' | 'disabled';
  description?: string;
  isSystem?: boolean;
}

export interface UpdateDictionaryDto extends Partial<CreateDictionaryDto> {}

export interface DictionaryResponse {
  success: boolean;
  data: any;
  code: string;
  format: 'tree' | 'dict';
}

export interface QueryDictionaryParams {
  keyword?: string;
  code?: string;
  codes?: string[];
  type?: 'tree' | 'dict';
  types?: ('tree' | 'dict')[];
  status?: 'enabled' | 'disabled';
  statuses?: ('enabled' | 'disabled')[];
  parentId?: string | null;
  parentIds?: string[];
  rootOnly?: boolean;
  includeChildren?: boolean;
  maxDepth?: number;
  minDepth?: number;
  value?: string;
  valueLike?: string;
  values?: string[];
  label?: string;
  labelLike?: string;
  descriptionLike?: string;
  extraKey?: string;
  extraValue?: string;
  extraPath?: string;
  isSystem?: boolean;
  ids?: string[];
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  includeDeleted?: boolean;
  includeParent?: boolean;
  includeChildrenRelation?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface DictionaryOption {
  label: string;
  value: string;
  id: string;
  code: string;
  [key: string]: any;
}

export interface GetOptionsParams {
  code?: string;
  parentId?: string | null;
  enabledOnly?: boolean;
  format?: 'options' | 'tree';
  labelField?: string;
  valueField?: string;
}

export const dictionariesApi = {
  // 获取字典列表（支持分页、搜索、过滤）
  getDictionaries: async (
    params?: QueryDictionaryParams,
  ): Promise<PaginationResponse<Dictionary>> => {
    return apiClient.get<PaginationResponse<Dictionary>>('/dictionaries', { params });
  },

  // 获取所有字典列表（扁平，不分页）
  getAllDictionaries: async (): Promise<Dictionary[]> => {
    return apiClient.get<Dictionary[]>('/dictionaries/all');
  },

  // 获取树形结构的字典列表
  getDictionaryTree: async (code?: string): Promise<Dictionary[]> => {
    return apiClient.get<Dictionary[]>('/dictionaries/tree', {
      params: code ? { code } : undefined,
    });
  },

  // 获取选项列表（用于下拉单选/多选）
  getOptions: async (
    params?: GetOptionsParams,
  ): Promise<DictionaryOption[] | DictionaryOption[]> => {
    return apiClient.get<DictionaryOption[] | DictionaryOption[]>('/dictionaries/options', {
      params,
    });
  },

  // 获取字典数据（支持tree和dict格式）
  getDictionary: async (
    code: string,
    format: 'tree' | 'dict' = 'dict',
  ): Promise<DictionaryResponse> => {
    return apiClient.get<DictionaryResponse>('/dictionaries/dict', {
      params: { code, format },
    });
  },

  // 获取所有字典（按编码分组）
  getGroupedDictionaries: async (type?: 'tree' | 'dict'): Promise<Record<string, Dictionary[]>> => {
    return apiClient.get<Record<string, Dictionary[]>>('/dictionaries/grouped', {
      params: type ? { type } : undefined,
    });
  },

  // 获取字典详情
  getDictionaryById: async (id: string): Promise<Dictionary> => {
    return apiClient.get<Dictionary>(`/dictionaries/${id}`);
  },

  // 创建字典
  createDictionary: async (data: CreateDictionaryDto): Promise<Dictionary> => {
    return apiClient.post<Dictionary>('/dictionaries', data);
  },

  // 更新字典
  updateDictionary: async (id: string, data: UpdateDictionaryDto): Promise<Dictionary> => {
    return apiClient.put<Dictionary>(`/dictionaries/${id}`, data);
  },

  // 删除字典
  deleteDictionary: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/dictionaries/${id}`);
  },

  // 批量删除字典
  batchDeleteDictionaries: async (ids: string[]): Promise<void> => {
    return apiClient.post<void>('/dictionaries/batch-delete', { ids });
  },

  // 批量查询字典（根据ID列表）
  getDictionariesByIds: async (
    ids: string[],
    includeRelations?: boolean,
  ): Promise<Dictionary[]> => {
    return apiClient.post<Dictionary[]>('/dictionaries/batch-get', {
      ids,
      includeRelations,
    });
  },

  // 统计字典数量（按条件分组）
  getDictionaryStats: async (
    params?: Partial<QueryDictionaryParams>,
  ): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byCode: Record<string, number>;
  }> => {
    return apiClient.get('/dictionaries/stats/count', { params });
  },

  // 获取字典的完整路径（从根节点到当前节点）
  getDictionaryPath: async (id: string): Promise<Dictionary[]> => {
    return apiClient.get<Dictionary[]>(`/dictionaries/${id}/path`);
  },

  // 获取字典的所有子节点（扁平列表）
  getDictionaryChildren: async (id: string): Promise<Dictionary[]> => {
    return apiClient.get<Dictionary[]>(`/dictionaries/${id}/children`);
  },

  // 检查字典是否存在（根据code和value）
  checkDictionaryExists: async (code: string, value?: string): Promise<{ exists: boolean }> => {
    return apiClient.get<{ exists: boolean }>('/dictionaries/exists/check', {
      params: { code, value },
    });
  },
};
