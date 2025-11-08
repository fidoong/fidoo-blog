/**
 * 后端事件类型定义
 * 统一管理所有领域事件
 */

/**
 * 用户相关事件
 */
export const USER_EVENTS = {
  CREATED: 'user.created',
  UPDATED: 'user.updated',
  DELETED: 'user.deleted',
  LOGIN: 'user.login',
  LOGOUT: 'user.logout',
} as const;

/**
 * 文章相关事件
 */
export const POST_EVENTS = {
  CREATED: 'post.created',
  UPDATED: 'post.updated',
  DELETED: 'post.deleted',
  PUBLISHED: 'post.published',
  VIEWED: 'post.viewed',
  LIKED: 'post.liked',
  UNLIKED: 'post.unliked',
  FAVORITED: 'post.favorited',
  UNFAVORITED: 'post.unfavorited',
} as const;

/**
 * 评论相关事件
 */
export const COMMENT_EVENTS = {
  CREATED: 'comment.created',
  UPDATED: 'comment.updated',
  DELETED: 'comment.deleted',
  APPROVED: 'comment.approved',
  REJECTED: 'comment.rejected',
  LIKED: 'comment.liked',
  UNLIKED: 'comment.unliked',
} as const;

/**
 * 通知相关事件
 */
export const NOTIFICATION_EVENTS = {
  CREATED: 'notification.created',
  READ: 'notification.read',
} as const;
