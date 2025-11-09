import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as os from 'os';
import { Post, PostStatus } from '@/modules/posts/entities/post.entity';
import { User, UserStatus } from '@/modules/users/entities/user.entity';
import { Comment, CommentStatus } from '@/modules/comments/entities/comment.entity';
import { Category } from '@/modules/categories/entities/category.entity';
import { Tag } from '@/modules/tags/entities/tag.entity';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      cpuCount: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
      nodeVersion: process.version,
    };
  }

  getProcessInfo() {
    const usage = process.memoryUsage();
    return {
      pid: process.pid,
      uptime: process.uptime(),
      memory: {
        rss: usage.rss,
        heapTotal: usage.heapTotal,
        heapUsed: usage.heapUsed,
        external: usage.external,
      },
      cpuUsage: process.cpuUsage(),
    };
  }

  async getDashboardStats() {
    // 文章统计
    const [totalPosts, publishedPosts, draftPosts] = await Promise.all([
      this.postRepository.count(),
      this.postRepository.count({ where: { status: PostStatus.PUBLISHED } }),
      this.postRepository.count({ where: { status: PostStatus.DRAFT } }),
    ]);

    // 用户统计
    const [totalUsers, activeUsers] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
    ]);

    // 评论统计
    const [totalComments, pendingComments] = await Promise.all([
      this.commentRepository.count(),
      this.commentRepository.count({ where: { status: CommentStatus.PENDING } }),
    ]);

    // 分类和标签统计
    const [totalCategories, totalTags] = await Promise.all([
      this.categoryRepository.count(),
      this.tagRepository.count(),
    ]);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalUsers,
      activeUsers,
      totalComments,
      pendingComments,
      totalCategories,
      totalTags,
    };
  }
}
