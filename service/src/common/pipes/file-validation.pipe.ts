import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { Express } from 'express';
import { BusinessException } from '@/common/exceptions';

export interface FileValidationOptions {
  maxSize?: number; // 文件大小限制（字节）
  allowedMimeTypes?: string[]; // 允许的 MIME 类型
  allowedExtensions?: string[]; // 允许的文件扩展名
}

/**
 * 文件验证管道
 */
@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly options: FileValidationOptions = {}) {}

  transform(file: Express.Multer.File, _metadata: ArgumentMetadata): Express.Multer.File {
    if (!file) {
      throw BusinessException.badRequest('文件不能为空');
    }

    // 验证文件大小
    if (this.options.maxSize && file.size > this.options.maxSize) {
      const maxSizeMB = (this.options.maxSize / 1024 / 1024).toFixed(2);
      throw BusinessException.badRequest(`文件大小不能超过 ${maxSizeMB}MB`);
    }

    // 验证 MIME 类型
    if (this.options.allowedMimeTypes && !this.options.allowedMimeTypes.includes(file.mimetype)) {
      throw BusinessException.badRequest(
        `不支持的文件类型，允许的类型: ${this.options.allowedMimeTypes.join(', ')}`,
      );
    }

    // 验证文件扩展名
    if (this.options.allowedExtensions) {
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      if (!fileExtension || !this.options.allowedExtensions.includes(fileExtension)) {
        throw BusinessException.badRequest(
          `不支持的文件扩展名，允许的扩展名: ${this.options.allowedExtensions.join(', ')}`,
        );
      }
    }

    return file;
  }
}
