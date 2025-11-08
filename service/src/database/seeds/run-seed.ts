import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '@/modules/users/entities/user.entity';
import { UserProfile } from '@/modules/user-profiles/entities/user-profile.entity';
import { Category } from '@/modules/categories/entities/category.entity';
import { Tag } from '@/modules/tags/entities/tag.entity';
import { Post, PostStatus } from '@/modules/posts/entities/post.entity';
import { Comment, CommentStatus } from '@/modules/comments/entities/comment.entity';

// 加载环境变量
config({ path: resolve(__dirname, '../../../.env') });

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'fidoo_blog',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('数据库连接成功');

    const userRepository = dataSource.getRepository(User);
    const userProfileRepository = dataSource.getRepository(UserProfile);
    const categoryRepository = dataSource.getRepository(Category);
    const tagRepository = dataSource.getRepository(Tag);
    const postRepository = dataSource.getRepository(Post);
    const commentRepository = dataSource.getRepository(Comment);

    // 清空现有数据（可选，谨慎使用）
    console.log('清理现有数据...');
    // 按照外键依赖关系的逆序删除，或者使用 CASCADE
    // 先删除有外键依赖的表
    await dataSource.query('TRUNCATE TABLE comments CASCADE');
    await dataSource.query('TRUNCATE TABLE post_tags CASCADE');
    await dataSource.query('TRUNCATE TABLE posts CASCADE');
    await dataSource.query('TRUNCATE TABLE tags CASCADE');
    await dataSource.query('TRUNCATE TABLE categories CASCADE');
    await dataSource.query('TRUNCATE TABLE user_profiles CASCADE');
    await dataSource.query('TRUNCATE TABLE users CASCADE');

    // 1. 创建用户
    console.log('创建用户...');
    const hashedPassword = await bcrypt.hash('123456', 10);

    const adminUser = userRepository.create({
      username: 'admin',
      email: 'admin@fidoo.com',
      password: hashedPassword,
      nickname: '管理员',
      bio: '系统管理员',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });
    await userRepository.save(adminUser);

    const editorUser = userRepository.create({
      username: 'editor',
      email: 'editor@fidoo.com',
      password: hashedPassword,
      nickname: '编辑',
      bio: '内容编辑',
      role: UserRole.EDITOR,
      status: UserStatus.ACTIVE,
    });
    await userRepository.save(editorUser);

    const users = [
      userRepository.create({
        username: 'zhangsan',
        email: 'zhangsan@fidoo.com',
        password: hashedPassword,
        nickname: '张三',
        bio: '前端开发工程师，专注于 React 和 Vue.js',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      }),
      userRepository.create({
        username: 'lisi',
        email: 'lisi@fidoo.com',
        password: hashedPassword,
        nickname: '李四',
        bio: '后端开发工程师，擅长 Node.js 和 NestJS',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      }),
      userRepository.create({
        username: 'wangwu',
        email: 'wangwu@fidoo.com',
        password: hashedPassword,
        nickname: '王五',
        bio: '全栈开发工程师',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      }),
    ];
    await userRepository.save(users);

    const allUsers = [adminUser, editorUser, ...users];

    // 2. 创建用户资料
    console.log('创建用户资料...');
    const profiles = allUsers.map((user) =>
      userProfileRepository.create({
        user,
        points: Math.floor(Math.random() * 1000),
        level: Math.floor(Math.random() * 10) + 1,
        articleCount: 0,
        followerCount: Math.floor(Math.random() * 100),
        followingCount: Math.floor(Math.random() * 50),
        likeCount: Math.floor(Math.random() * 500),
        favoriteCount: Math.floor(Math.random() * 50),
        viewCount: Math.floor(Math.random() * 1000),
        location: ['北京', '上海', '深圳', '杭州', '广州'][Math.floor(Math.random() * 5)],
        company: ['腾讯', '阿里', '字节', '美团', '百度'][Math.floor(Math.random() * 5)],
        github: `https://github.com/${user.username}`,
        isVerified: user.role === UserRole.ADMIN || user.role === UserRole.EDITOR,
      }),
    );
    await userProfileRepository.save(profiles);

    // 3. 创建分类
    console.log('创建分类...');
    const categories = [
      categoryRepository.create({
        name: '前端开发',
        slug: 'frontend',
        description: '前端技术相关文章',
        sortOrder: 1,
        isActive: true,
      }),
      categoryRepository.create({
        name: '后端开发',
        slug: 'backend',
        description: '后端技术相关文章',
        sortOrder: 2,
        isActive: true,
      }),
      categoryRepository.create({
        name: '移动开发',
        slug: 'mobile',
        description: '移动端开发相关文章',
        sortOrder: 3,
        isActive: true,
      }),
      categoryRepository.create({
        name: '人工智能',
        slug: 'ai',
        description: 'AI 和机器学习相关文章',
        sortOrder: 4,
        isActive: true,
      }),
      categoryRepository.create({
        name: '开发工具',
        slug: 'tools',
        description: '开发工具和效率提升',
        sortOrder: 5,
        isActive: true,
      }),
      categoryRepository.create({
        name: '代码人生',
        slug: 'life',
        description: '程序员的生活和思考',
        sortOrder: 6,
        isActive: true,
      }),
    ];
    await categoryRepository.save(categories);

    // 4. 创建标签
    console.log('创建标签...');
    const tags = [
      tagRepository.create({ name: 'JavaScript', slug: 'javascript', color: '#F7DF1E' }),
      tagRepository.create({ name: 'TypeScript', slug: 'typescript', color: '#3178C6' }),
      tagRepository.create({ name: 'React', slug: 'react', color: '#61DAFB' }),
      tagRepository.create({ name: 'Vue.js', slug: 'vue', color: '#4FC08D' }),
      tagRepository.create({ name: 'Node.js', slug: 'nodejs', color: '#339933' }),
      tagRepository.create({ name: 'NestJS', slug: 'nestjs', color: '#E0234E' }),
      tagRepository.create({ name: 'Python', slug: 'python', color: '#3776AB' }),
      tagRepository.create({ name: 'Java', slug: 'java', color: '#ED8B00' }),
      tagRepository.create({ name: 'Go', slug: 'go', color: '#00ADD8' }),
      tagRepository.create({ name: 'Docker', slug: 'docker', color: '#2496ED' }),
      tagRepository.create({ name: 'Kubernetes', slug: 'kubernetes', color: '#326CE5' }),
      tagRepository.create({ name: 'MySQL', slug: 'mysql', color: '#4479A1' }),
      tagRepository.create({ name: 'PostgreSQL', slug: 'postgresql', color: '#336791' }),
      tagRepository.create({ name: 'Redis', slug: 'redis', color: '#DC382D' }),
      tagRepository.create({ name: 'MongoDB', slug: 'mongodb', color: '#47A248' }),
      tagRepository.create({ name: 'Git', slug: 'git', color: '#F05032' }),
      tagRepository.create({ name: 'GitHub', slug: 'github', color: '#181717' }),
      tagRepository.create({ name: 'Linux', slug: 'linux', color: '#FCC624' }),
      tagRepository.create({ name: '算法', slug: 'algorithm', color: '#FF6B6B' }),
      tagRepository.create({ name: '数据结构', slug: 'data-structure', color: '#4ECDC4' }),
    ];
    await tagRepository.save(tags);

    // 5. 创建文章
    console.log('创建文章...');
    const postTitles = [
      {
        title: '深入理解 React Hooks',
        slug: 'understanding-react-hooks',
        summary: '本文深入探讨 React Hooks 的原理和使用场景，帮助你更好地理解和使用 Hooks。',
        category: categories[0],
        tags: [tags[0], tags[2]],
        author: users[0],
      },
      {
        title: 'TypeScript 高级类型系统',
        slug: 'typescript-advanced-types',
        summary: '学习 TypeScript 的高级类型系统，包括条件类型、映射类型等。',
        category: categories[0],
        tags: [tags[1], tags[0]],
        author: users[0],
      },
      {
        title: 'NestJS 微服务架构实践',
        slug: 'nestjs-microservices',
        summary: '使用 NestJS 构建微服务架构的完整实践指南。',
        category: categories[1],
        tags: [tags[5], tags[4]],
        author: users[1],
      },
      {
        title: 'Docker 容器化最佳实践',
        slug: 'docker-best-practices',
        summary: '分享 Docker 容器化的最佳实践和常见问题解决方案。',
        category: categories[4],
        tags: [tags[9], tags[10]],
        author: users[1],
      },
      {
        title: 'PostgreSQL 性能优化指南',
        slug: 'postgresql-performance',
        summary: 'PostgreSQL 数据库性能优化的实用技巧和策略。',
        category: categories[1],
        tags: [tags[12], tags[13]],
        author: editorUser,
      },
      {
        title: 'Vue 3 Composition API 详解',
        slug: 'vue3-composition-api',
        summary: '全面介绍 Vue 3 的 Composition API，包括 setup、ref、reactive 等。',
        category: categories[0],
        tags: [tags[3], tags[0]],
        author: users[2],
      },
      {
        title: '程序员的时间管理',
        slug: 'programmer-time-management',
        summary: '如何高效管理时间，提高编程效率。',
        category: categories[5],
        tags: [tags[15]],
        author: users[2],
      },
      {
        title: 'Redis 缓存策略与实践',
        slug: 'redis-caching-strategy',
        summary: 'Redis 缓存的各种策略和实际应用场景。',
        category: categories[1],
        tags: [tags[13], tags[14]],
        author: users[1],
      },
    ];

    const posts = postTitles.map((postData, index) => {
      const publishedAt = new Date();
      publishedAt.setDate(publishedAt.getDate() - index * 2); // 每篇文章间隔2天

      return postRepository.create({
        ...postData,
        content: `# ${postData.title}\n\n${postData.summary}\n\n## 正文内容\n\n这是一篇关于 ${postData.title} 的详细文章。文章内容包含多个章节，深入探讨了相关主题。\n\n### 章节一\n\n详细内容...\n\n### 章节二\n\n更多内容...\n\n## 总结\n\n通过本文的学习，你应该对相关主题有了更深入的理解。`,
        status: PostStatus.PUBLISHED,
        publishedAt,
        viewCount: Math.floor(Math.random() * 1000) + 100,
        likeCount: Math.floor(Math.random() * 100) + 10,
        commentCount: Math.floor(Math.random() * 50) + 5,
        favoriteCount: Math.floor(Math.random() * 30) + 3,
        isFeatured: index < 3,
        isTop: index === 0,
      });
    });

    await postRepository.save(posts);

    // 更新用户文章数
    for (const user of allUsers) {
      const userPosts = posts.filter((p) => p.author.id === user.id);
      const profile = profiles.find((p) => p.user.id === user.id);
      if (profile) {
        profile.articleCount = userPosts.length;
        await userProfileRepository.save(profile);
      }
    }

    // 6. 创建评论
    console.log('创建评论...');
    const comments = [];
    for (const post of posts.slice(0, 5)) {
      // 每篇文章创建 3-5 条评论
      const commentCount = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < commentCount; i++) {
        const comment = commentRepository.create({
          content: `这是一条关于"${post.title}"的评论。非常不错的文章！`,
          status: CommentStatus.APPROVED,
          user: allUsers[Math.floor(Math.random() * allUsers.length)],
          post,
          likeCount: Math.floor(Math.random() * 20),
        });
        comments.push(comment);
      }
    }
    await commentRepository.save(comments);

    // 更新文章评论数
    for (const post of posts) {
      const postComments = comments.filter((c) => c.post.id === post.id);
      post.commentCount = postComments.length;
      await postRepository.save(post);
    }

    console.log('✅ 数据种子创建完成！');
    console.log(`- 用户: ${allUsers.length} 个`);
    console.log(`- 分类: ${categories.length} 个`);
    console.log(`- 标签: ${tags.length} 个`);
    console.log(`- 文章: ${posts.length} 篇`);
    console.log(`- 评论: ${comments.length} 条`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ 种子数据创建失败:', error);
    process.exit(1);
  }
}

seed();
