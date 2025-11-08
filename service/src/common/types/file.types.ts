import { Express } from 'express';

/**
 * 文件相关类型定义
 */

/**
 * 文件上传结果
 */
export interface FileUploadResult {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

/**
 * 文件验证选项
 */
export interface FileValidationOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

/**
 * 文件信息
 */
export interface FileInfo {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

/**
 * 多文件上传结果
 */
export interface MultipleFileUploadResult {
  files: FileUploadResult[];
  total: number;
}
