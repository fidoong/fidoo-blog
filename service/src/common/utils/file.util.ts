import * as path from 'path';
import { Express } from 'express';

/**
 * 文件工具类
 */
export class FileUtil {
  /**
   * 获取文件扩展名
   * @param filename 文件名
   * @returns 扩展名（不含点）
   */
  static getExtension(filename: string): string {
    return path.extname(filename).slice(1).toLowerCase();
  }

  /**
   * 获取文件名（不含扩展名）
   * @param filename 文件名
   * @returns 文件名（不含扩展名）
   */
  static getFilenameWithoutExtension(filename: string): string {
    return path.basename(filename, path.extname(filename));
  }

  /**
   * 生成唯一文件名
   * @param originalname 原始文件名
   * @returns 唯一文件名
   */
  static generateUniqueFilename(originalname: string): string {
    const ext = this.getExtension(originalname);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}.${ext}`;
  }

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @returns 格式化后的文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * 验证文件类型
   * @param file 文件
   * @param allowedTypes 允许的类型数组
   * @returns 是否允许
   */
  static isValidFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.mimetype);
  }

  /**
   * 验证文件扩展名
   * @param filename 文件名
   * @param allowedExtensions 允许的扩展名数组
   * @returns 是否允许
   */
  static isValidExtension(filename: string, allowedExtensions: string[]): boolean {
    const ext = this.getExtension(filename);
    return allowedExtensions.includes(ext);
  }

  /**
   * 验证文件大小
   * @param size 文件大小（字节）
   * @param maxSize 最大大小（字节）
   * @returns 是否有效
   */
  static isValidFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  }

  /**
   * 获取 MIME 类型对应的扩展名
   * @param mimeType MIME 类型
   * @returns 扩展名
   */
  static getExtensionFromMimeType(mimeType: string): string {
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
      'application/json': 'json',
      'text/plain': 'txt',
      'text/html': 'html',
      'application/zip': 'zip',
    };
    return mimeMap[mimeType] || 'bin';
  }
}
