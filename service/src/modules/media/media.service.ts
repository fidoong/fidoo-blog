import { Injectable } from '@nestjs/common';
import { BusinessException } from '@/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaType } from './entities/media.entity';
import * as path from 'path';
import * as fs from 'fs/promises';
import sharp from 'sharp';

@Injectable()
export class MediaService {
  private uploadDir = 'uploads';

  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, uploaderId: string): Promise<Media> {
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);

    // 如果是图片，进行压缩处理
    if (file.mimetype.startsWith('image/')) {
      const imageBuffer = await sharp(file.buffer)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      await fs.writeFile(filepath, imageBuffer);
    } else {
      await fs.writeFile(filepath, file.buffer);
    }

    // 获取图片尺寸
    let width: number | undefined;
    let height: number | undefined;
    if (file.mimetype.startsWith('image/')) {
      const metadata = await sharp(filepath).metadata();
      width = metadata.width;
      height = metadata.height;
    }

    const media = this.mediaRepository.create({
      filename,
      originalName: file.originalname,
      path: filepath,
      url: `/uploads/${filename}`,
      mimeType: file.mimetype,
      type: this.getMediaType(file.mimetype),
      size: file.size,
      width,
      height,
      uploader: { id: uploaderId },
    });

    return this.mediaRepository.save(media);
  }

  private getMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
    return MediaType.DOCUMENT;
  }

  async findAll(page = 1, limit = 20, type?: MediaType) {
    const queryBuilder = this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.uploader', 'uploader');

    if (type) {
      queryBuilder.where('media.type = :type', { type });
    }

    const [media, total] = await queryBuilder
      .orderBy('media.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: media,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['uploader'],
    });

    if (!media) {
      throw BusinessException.notFound('媒体文件不存在');
    }

    return media;
  }

  async remove(id: string): Promise<void> {
    const media = await this.findOne(id);

    // 删除文件
    try {
      await fs.unlink(media.path);
    } catch (error) {
      console.error('删除文件失败:', error);
    }

    await this.mediaRepository.softRemove(media);
  }
}
