// API 响应类型（匹配后端返回结构）
export interface ApiResponse<T = any> {
  code: number; // 0 表示成功，非 0 表示失败
  data?: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: number; // 非 0 表示失败
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
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 标签类型
export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface CreateCommentDto {
  content: string;
  postId: string;
  parentId?: string;
}

// 查询参数类型
export interface PostQueryParams extends PaginationParams {
  status?: PostStatus;
  categoryId?: string;
  authorId?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
