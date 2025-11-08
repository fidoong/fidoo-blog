/**
 * 文件相关常量
 */
export const FILE_CONSTANTS = {
  // 文件大小限制（字节）
  MAX_FILE_SIZE: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    DEFAULT: 10 * 1024 * 1024, // 10MB
  },

  // 允许的图片 MIME 类型
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],

  // 允许的文档 MIME 类型
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],

  // 允许的视频 MIME 类型
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],

  // 允许的文件扩展名
  ALLOWED_EXTENSIONS: {
    IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    DOCUMENT: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
    VIDEO: ['mp4', 'mpeg', 'mov', 'avi'],
  },
} as const;
