// API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  data?: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: number;
  message: string;
  data?: any;
  timestamp: string;
}

// 分页类型
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  nickname: string | null;
  avatar: string | null;
  bio: string | null;
  role: 'admin' | 'editor' | 'user';
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// 文章类型
export type PostStatus = 'draft' | 'published' | 'archived';

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  status: PostStatus;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  isFeatured: boolean;
  isTop: boolean;
  publishedAt: string | null;
  author: User;
  category: Category | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDto {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImage?: string;
  status?: PostStatus;
  categoryId?: string;
  tagIds?: string[];
  isFeatured?: boolean;
  isTop?: boolean;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
  level: number;
  sortOrder: number;
  isActive: boolean;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  level?: number;
  sortOrder?: number;
  isActive?: boolean;
  icon?: string | null;
}

// 标签类型
export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  categoryId: string | null;
  category?: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagDto {
  name: string;
  slug: string;
  color?: string;
  categoryId?: string | null;
}

// 评论类型
export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface Comment {
  id: string;
  content: string;
  status: CommentStatus;
  likeCount: number;
  user: User;
  post: Post;
  parent: Comment | null;
  children: Comment[];
  createdAt: string;
  updatedAt: string;
}

// 媒体类型
export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  createdAt: string;
  updatedAt: string;
}

// 系统信息类型
export interface SystemInfo {
  nodeVersion: string;
  platform: string;
  arch: string;
  cpuCount: number;
  totalMemory: number;
  freeMemory: number;
  uptime: number;
}

export interface ProcessInfo {
  pid: number;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
}

// 查询参数类型
export interface PostQueryParams extends PaginationParams {
  status?: PostStatus;
  categoryId?: string;
  categoryLevel?: number;
  authorId?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UserQueryParams extends PaginationParams {
  role?: 'admin' | 'editor' | 'user';
  status?: 'active' | 'inactive' | 'banned';
  keyword?: string;
}

export interface CommentQueryParams extends PaginationParams {
  status?: CommentStatus;
  postId?: string;
  userId?: string;
}

// 仪表盘统计类型
export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalUsers: number;
  activeUsers: number;
  totalComments: number;
  pendingComments: number;
  totalCategories: number;
  totalTags: number;
}

