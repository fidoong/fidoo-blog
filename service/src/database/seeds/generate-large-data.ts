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
import { Like, LikeType } from '@/modules/likes/entities/like.entity';
import { Favorite } from '@/modules/favorites/entities/favorite.entity';
import { Follow } from '@/modules/follows/entities/follow.entity';

// 加载环境变量
config({ path: resolve(__dirname, '../../../.env') });

// 中文姓名库
const chineseNames = [
  '张伟',
  '王芳',
  '李娜',
  '刘强',
  '陈静',
  '杨洋',
  '赵敏',
  '黄磊',
  '周杰',
  '吴秀波',
  '徐静',
  '朱军',
  '马化腾',
  '马云',
  '李彦宏',
  '刘强东',
  '雷军',
  '丁磊',
  '张朝阳',
  '王兴',
  '程维',
  '王健林',
  '许家印',
  '杨惠妍',
  '何享健',
  '张近东',
  '黄峥',
  '张一鸣',
  '宿华',
  '程一笑',
  '李明',
  '王丽',
  '张敏',
  '刘洋',
  '陈军',
  '杨静',
  '赵强',
  '黄伟',
  '周敏',
  '吴军',
  '徐伟',
  '朱静',
  '马军',
  '王强',
  '李静',
  '刘敏',
  '陈伟',
  '杨军',
  '赵静',
  '黄强',
];

// 英文用户名库
const englishUsernames = [
  'alex',
  'bob',
  'charlie',
  'david',
  'emma',
  'frank',
  'grace',
  'henry',
  'ivy',
  'jack',
  'kate',
  'liam',
  'mia',
  'noah',
  'olivia',
  'peter',
  'quinn',
  'ruby',
  'sam',
  'tina',
  'uma',
  'victor',
  'willa',
  'xavier',
  'yara',
  'zoe',
  'adam',
  'bella',
  'carl',
  'diana',
  'ethan',
  'fiona',
  'george',
  'hannah',
  'ian',
  'julia',
  'kevin',
  'luna',
  'mike',
  'nina',
  'oscar',
  'paula',
  'quinn',
  'ryan',
  'sara',
  'tom',
  'una',
  'vince',
  'wendy',
  'xander',
];

// 技术标签库
const techTags = [
  { name: 'JavaScript', slug: 'javascript', color: '#F7DF1E' },
  { name: 'TypeScript', slug: 'typescript', color: '#3178C6' },
  { name: 'React', slug: 'react', color: '#61DAFB' },
  { name: 'Vue.js', slug: 'vue', color: '#4FC08D' },
  { name: 'Angular', slug: 'angular', color: '#DD0031' },
  { name: 'Node.js', slug: 'nodejs', color: '#339933' },
  { name: 'NestJS', slug: 'nestjs', color: '#E0234E' },
  { name: 'Express', slug: 'express', color: '#000000' },
  { name: 'Python', slug: 'python', color: '#3776AB' },
  { name: 'Django', slug: 'django', color: '#092E20' },
  { name: 'Flask', slug: 'flask', color: '#000000' },
  { name: 'Java', slug: 'java', color: '#ED8B00' },
  { name: 'Spring', slug: 'spring', color: '#6DB33F' },
  { name: 'Go', slug: 'go', color: '#00ADD8' },
  { name: 'Rust', slug: 'rust', color: '#000000' },
  { name: 'PHP', slug: 'php', color: '#777BB4' },
  { name: 'Laravel', slug: 'laravel', color: '#FF2D20' },
  { name: 'Ruby', slug: 'ruby', color: '#CC342D' },
  { name: 'Rails', slug: 'rails', color: '#CC0000' },
  { name: 'Swift', slug: 'swift', color: '#FA7343' },
  { name: 'Kotlin', slug: 'kotlin', color: '#7F52FF' },
  { name: 'Dart', slug: 'dart', color: '#0175C2' },
  { name: 'Flutter', slug: 'flutter', color: '#02569B' },
  { name: 'React Native', slug: 'react-native', color: '#61DAFB' },
  { name: 'Docker', slug: 'docker', color: '#2496ED' },
  { name: 'Kubernetes', slug: 'kubernetes', color: '#326CE5' },
  { name: 'AWS', slug: 'aws', color: '#232F3E' },
  { name: 'Azure', slug: 'azure', color: '#0078D4' },
  { name: 'GCP', slug: 'gcp', color: '#4285F4' },
  { name: 'MySQL', slug: 'mysql', color: '#4479A1' },
  { name: 'PostgreSQL', slug: 'postgresql', color: '#336791' },
  { name: 'MongoDB', slug: 'mongodb', color: '#47A248' },
  { name: 'Redis', slug: 'redis', color: '#DC382D' },
  { name: 'Elasticsearch', slug: 'elasticsearch', color: '#005571' },
  { name: 'GraphQL', slug: 'graphql', color: '#E10098' },
  { name: 'REST API', slug: 'rest-api', color: '#FF6B6B' },
  { name: '微服务', slug: 'microservices', color: '#4ECDC4' },
  { name: 'DevOps', slug: 'devops', color: '#0F4C75' },
  { name: 'CI/CD', slug: 'cicd', color: '#FF6B6B' },
  { name: 'Git', slug: 'git', color: '#F05032' },
  { name: 'GitHub', slug: 'github', color: '#181717' },
  { name: 'GitLab', slug: 'gitlab', color: '#FC6D26' },
  { name: 'Linux', slug: 'linux', color: '#FCC624' },
  { name: '算法', slug: 'algorithm', color: '#FF6B6B' },
  { name: '数据结构', slug: 'data-structure', color: '#4ECDC4' },
  { name: '设计模式', slug: 'design-pattern', color: '#FFA500' },
  { name: '架构设计', slug: 'architecture', color: '#9B59B6' },
  { name: '性能优化', slug: 'performance', color: '#E74C3C' },
  { name: '安全', slug: 'security', color: '#C0392B' },
  { name: '测试', slug: 'testing', color: '#27AE60' },
  { name: '前端', slug: 'frontend', color: '#3498DB' },
  { name: '后端', slug: 'backend', color: '#E67E22' },
  { name: '全栈', slug: 'fullstack', color: '#9B59B6' },
  { name: '移动开发', slug: 'mobile', color: '#1ABC9C' },
  { name: 'Web3', slug: 'web3', color: '#F16822' },
  { name: '区块链', slug: 'blockchain', color: '#F7931A' },
  { name: 'AI', slug: 'ai', color: '#FF6B6B' },
  { name: '机器学习', slug: 'machine-learning', color: '#4ECDC4' },
  { name: '深度学习', slug: 'deep-learning', color: '#95A5A6' },
];

// 文章标题模板
const articleTemplates = [
  '深入理解 {topic}',
  '{topic} 最佳实践',
  '{topic} 从入门到精通',
  '掌握 {topic} 的核心概念',
  '{topic} 实战教程',
  '{topic} 性能优化指南',
  '{topic} 常见问题解决方案',
  '如何使用 {topic} 构建应用',
  '{topic} 源码解析',
  '{topic} 设计模式应用',
  '{topic} 开发技巧分享',
  '{topic} 进阶指南',
  '{topic} 最佳实践总结',
  '{topic} 踩坑记录',
  '{topic} 新特性详解',
];

// 文章内容模板
const contentTemplates = [
  `# {title}

## 前言

本文将从基础概念开始，深入探讨 {topic} 的各个方面。

## 什么是 {topic}

{topic} 是一个非常重要的技术概念...

## 核心特性

1. **特性一**：详细说明...
2. **特性二**：详细说明...
3. **特性三**：详细说明...

## 实际应用

在实际项目中，我们可以这样使用 {topic}：

\`\`\`javascript
// 示例代码
const example = "示例";
\`\`\`\n

## 最佳实践

1. 实践建议一
2. 实践建议二
3. 实践建议三

## 总结

通过本文的学习，相信你对 {topic} 有了更深入的理解。`,

  `# {title}

## 简介

{topic} 是当前最热门的技术之一，本文将带你全面了解它。

## 快速开始

### 安装

\`\`\`bash
npm install {topic}
\`\`\`

### 基本使用

\`\`\`javascript
import { topic } from '{topic}';
\`\`\`

## 高级特性

### 特性一

详细说明...

### 特性二

详细说明...

## 常见问题

**Q: 问题一？**
A: 答案一

**Q: 问题二？**
A: 答案二

## 参考资料

- 官方文档
- 相关文章

## 结语

希望本文对你有所帮助！`,
];

// 评论内容模板
const commentTemplates = [
  '非常不错的文章，学到了很多！',
  '感谢分享，很有帮助！',
  '写得很好，期待更多内容。',
  '这个解决方案很实用，已经应用到项目中了。',
  '受益匪浅，谢谢作者！',
  '有个小问题想请教一下...',
  '很详细的教程，收藏了！',
  '作者写得真不错，继续加油！',
  '这个技术点讲得很清楚，点赞！',
  '学到了新知识，感谢！',
];

// 城市列表
const cities = ['北京', '上海', '深圳', '杭州', '广州', '成都', '南京', '武汉', '西安', '苏州'];

// 公司列表
const companies = [
  '腾讯',
  '阿里巴巴',
  '字节跳动',
  '美团',
  '百度',
  '京东',
  '网易',
  '滴滴',
  '小米',
  '华为',
  '蚂蚁集团',
  '拼多多',
  '快手',
  '小红书',
  'B站',
  '知乎',
  '微博',
  '360',
  '搜狗',
  '爱奇艺',
];

// 随机选择数组元素
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// 随机选择多个元素
function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// 生成随机日期（过去N天内）
function randomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

// 生成随机整数
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateLargeData() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'fidoo_blog',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false, // 关闭日志以提高性能
  });

  try {
    await dataSource.initialize();
    console.log('✅ 数据库连接成功');

    const userRepository = dataSource.getRepository(User);
    const userProfileRepository = dataSource.getRepository(UserProfile);
    const categoryRepository = dataSource.getRepository(Category);
    const tagRepository = dataSource.getRepository(Tag);
    const postRepository = dataSource.getRepository(Post);
    const commentRepository = dataSource.getRepository(Comment);
    const likeRepository = dataSource.getRepository(Like);
    const favoriteRepository = dataSource.getRepository(Favorite);
    const followRepository = dataSource.getRepository(Follow);

    // 清空现有数据（按外键依赖关系的逆序删除）
    console.log('🧹 清理现有数据...');
    try {
      await dataSource.query('TRUNCATE TABLE likes CASCADE');
      await dataSource.query('TRUNCATE TABLE favorites CASCADE');
      await dataSource.query('TRUNCATE TABLE follows CASCADE');
      await dataSource.query('TRUNCATE TABLE comments CASCADE');
      await dataSource.query('TRUNCATE TABLE post_tags CASCADE');
      await dataSource.query('TRUNCATE TABLE posts CASCADE');
      await dataSource.query('TRUNCATE TABLE tags CASCADE');
      await dataSource.query('TRUNCATE TABLE categories CASCADE');
      await dataSource.query('TRUNCATE TABLE user_profiles CASCADE');
      await dataSource.query('TRUNCATE TABLE users CASCADE');
      console.log('✅ 数据清理完成');
    } catch (error) {
      console.log('⚠️  清理数据时出现错误（可能表不存在），继续执行...');
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1. 创建用户（150个）
    console.log('📝 创建用户...');
    const users: User[] = [];
    const batchSize = 50;

    for (let i = 0; i < 150; i++) {
      const isChinese = Math.random() > 0.5;
      const name = isChinese ? randomChoice(chineseNames) : randomChoice(englishUsernames);
      const username = `${name.toLowerCase()}${i}`;
      const email = `${username}@example.com`;

      const user = userRepository.create({
        username,
        email,
        password: hashedPassword,
        nickname: name,
        bio: `${name}，专注于技术分享`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        role: i === 0 ? UserRole.ADMIN : i < 5 ? UserRole.EDITOR : UserRole.USER,
        status: UserStatus.ACTIVE,
        lastLoginAt: randomDate(30),
      });

      users.push(user);

      // 批量保存
      if (users.length >= batchSize) {
        await userRepository.save(users);
        console.log(`  已创建 ${users.length} 个用户...`);
        users.length = 0; // 清空数组但保留引用
      }
    }

    if (users.length > 0) {
      await userRepository.save(users);
    }

    const allUsers = await userRepository.find();
    console.log(`✅ 创建了 ${allUsers.length} 个用户`);

    // 2. 创建用户资料
    console.log('📝 创建用户资料...');
    const profiles: UserProfile[] = [];
    for (const user of allUsers) {
      const profile = userProfileRepository.create({
        user,
        points: randomInt(0, 5000),
        level: randomInt(1, 20),
        articleCount: 0,
        followerCount: randomInt(0, 500),
        followingCount: randomInt(0, 200),
        likeCount: randomInt(0, 2000),
        favoriteCount: randomInt(0, 100),
        viewCount: randomInt(0, 10000),
        location: randomChoice(cities),
        company: randomChoice(companies),
        github: `https://github.com/${user.username}`,
        isVerified: user.role !== UserRole.USER,
      });
      profiles.push(profile);
    }
    await userProfileRepository.save(profiles);
    console.log(`✅ 创建了 ${profiles.length} 个用户资料`);

    // 3. 创建分类（树形结构：大类 -> 子分类）
    console.log('📝 创建分类（树形结构）...');

    // 定义大类（level=0）
    const mainCategoriesData = [
      {
        name: '金融',
        slug: 'finance',
        description: '金融、投资、理财相关',
        icon: '💰',
        subCategories: [
          { name: '股票投资', slug: 'stock', description: '股票市场分析与投资策略' },
          { name: '基金理财', slug: 'fund', description: '基金产品与理财规划' },
          { name: '数字货币', slug: 'crypto', description: '加密货币与区块链金融' },
          { name: '保险', slug: 'insurance', description: '保险产品与风险管理' },
          { name: '银行', slug: 'banking', description: '银行业务与金融服务' },
        ],
      },
      {
        name: '科技',
        slug: 'tech',
        description: '科技、互联网、IT技术',
        icon: '💻',
        subCategories: [
          { name: '前端开发', slug: 'frontend', description: '前端技术相关文章' },
          { name: '后端开发', slug: 'backend', description: '后端技术相关文章' },
          { name: '移动开发', slug: 'mobile', description: '移动端开发相关文章' },
          { name: '人工智能', slug: 'ai', description: 'AI 和机器学习相关文章' },
          { name: '开发工具', slug: 'tools', description: '开发工具和效率提升' },
          { name: '数据库', slug: 'database', description: '数据库相关技术' },
          { name: 'DevOps', slug: 'devops', description: 'DevOps 和运维相关' },
          { name: '架构设计', slug: 'architecture', description: '系统架构设计' },
        ],
      },
      {
        name: '游戏',
        slug: 'gaming',
        description: '游戏、电竞、游戏开发',
        icon: '🎮',
        subCategories: [
          { name: '游戏评测', slug: 'game-review', description: '游戏产品评测与推荐' },
          { name: '游戏开发', slug: 'game-dev', description: '游戏开发技术与引擎' },
          { name: '电竞', slug: 'esports', description: '电子竞技赛事与选手' },
          { name: '游戏攻略', slug: 'game-guide', description: '游戏攻略与技巧分享' },
        ],
      },
      {
        name: '体育',
        slug: 'sports',
        description: '体育、运动、健身',
        icon: '⚽',
        subCategories: [
          { name: '足球', slug: 'football', description: '足球赛事与新闻' },
          { name: '篮球', slug: 'basketball', description: '篮球赛事与新闻' },
          { name: '健身', slug: 'fitness', description: '健身训练与营养' },
          { name: '跑步', slug: 'running', description: '跑步训练与马拉松' },
        ],
      },
      {
        name: '政治',
        slug: 'politics',
        description: '政治、社会、时事',
        icon: '🏛️',
        subCategories: [
          { name: '时政', slug: 'current-affairs', description: '时事政治与政策解读' },
          { name: '国际', slug: 'international', description: '国际关系与外交' },
          { name: '社会', slug: 'society', description: '社会现象与民生' },
        ],
      },
      {
        name: '生活',
        slug: 'life',
        description: '生活、娱乐、文化',
        icon: '🎨',
        subCategories: [
          { name: '美食', slug: 'food', description: '美食制作与探店' },
          { name: '旅行', slug: 'travel', description: '旅行攻略与游记' },
          { name: '摄影', slug: 'photography', description: '摄影技巧与作品分享' },
          { name: '阅读', slug: 'reading', description: '读书笔记与书评' },
          { name: '电影', slug: 'movie', description: '电影评论与推荐' },
        ],
      },
    ];

    // 创建大类
    const mainCategories: Category[] = [];
    for (let i = 0; i < mainCategoriesData.length; i++) {
      const mainCat = mainCategoriesData[i];
      const mainCategory = categoryRepository.create({
        name: mainCat.name,
        slug: mainCat.slug,
        description: mainCat.description,
        icon: mainCat.icon,
        level: 0,
        parentId: null,
        sortOrder: i + 1,
        isActive: true,
      });
      mainCategories.push(mainCategory);
    }
    await categoryRepository.save(mainCategories);
    console.log(`✅ 创建了 ${mainCategories.length} 个大类`);

    // 创建子分类
    const allCategories: Category[] = [...mainCategories];
    for (let i = 0; i < mainCategories.length; i++) {
      const mainCategory = mainCategories[i];
      const mainCatData = mainCategoriesData[i];
      const subCategories: Category[] = [];

      for (let j = 0; j < mainCatData.subCategories.length; j++) {
        const subCat = mainCatData.subCategories[j];
        const subCategory = categoryRepository.create({
          name: subCat.name,
          slug: subCat.slug,
          description: subCat.description,
          icon: null,
          level: 1,
          parentId: mainCategory.id,
          sortOrder: j + 1,
          isActive: true,
        });
        subCategories.push(subCategory);
      }

      await categoryRepository.save(subCategories);
      allCategories.push(...subCategories);
      console.log(`  ✅ 为"${mainCategory.name}"创建了 ${subCategories.length} 个子分类`);
    }

    console.log(
      `✅ 总共创建了 ${allCategories.length} 个分类（${mainCategories.length} 个大类 + ${allCategories.length - mainCategories.length} 个子分类）`,
    );

    // 4. 创建标签（关联到分类）
    console.log('📝 创建标签（关联到分类）...');
    const tags: Tag[] = [];
    const createdTagNames = new Set<string>(); // 跟踪已创建的标签名称

    // 为每个子分类创建 3-8 个相关标签
    const subCategories = allCategories.filter((cat) => cat.level === 1);

    // 技术类标签（关联到科技类的子分类）
    const techSubCategories = subCategories.filter(
      (cat) => cat.parentId === mainCategories.find((m) => m.slug === 'tech')?.id,
    );

    // 为科技类子分类分配标签
    const techCategoryMap: Record<string, string[]> = {
      frontend: ['JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', '前端', 'CSS', 'HTML'],
      backend: ['Node.js', 'NestJS', 'Express', 'Python', 'Java', 'Go', '后端', 'API'],
      mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', '移动开发', 'iOS', 'Android'],
      ai: ['AI', '机器学习', '深度学习', 'TensorFlow', 'PyTorch', '神经网络'],
      tools: ['Git', 'GitHub', 'Docker', 'Kubernetes', 'CI/CD', 'DevOps', 'Linux'],
      database: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', '数据库'],
      devops: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'DevOps'],
      architecture: ['微服务', '架构设计', '设计模式', '系统设计', '分布式'],
    };

    for (const subCat of techSubCategories) {
      const tagNames = techCategoryMap[subCat.slug] || [];
      for (const tagName of tagNames) {
        // 如果标签名称已存在，跳过（避免重复）
        if (createdTagNames.has(tagName)) {
          continue;
        }

        const existingTag = techTags.find((t) => t.name === tagName);
        if (existingTag) {
          const tag = tagRepository.create({
            ...existingTag,
            categoryId: subCat.id,
          });
          tags.push(tag);
          createdTagNames.add(tagName);
        }
      }
    }

    // 为其他分类创建通用标签
    const otherTags = [
      { name: '投资', slug: 'investment', color: '#FF6B6B' },
      { name: '理财', slug: 'finance', color: '#4ECDC4' },
      { name: '股票', slug: 'stock', color: '#45B7D1' },
      { name: '游戏评测', slug: 'game-review', color: '#96CEB4' },
      { name: '游戏开发', slug: 'game-dev', color: '#FFEAA7' },
      { name: '电竞', slug: 'esports', color: '#DDA0DD' },
      { name: '足球', slug: 'football', color: '#98D8C8' },
      { name: '篮球', slug: 'basketball', color: '#F7DC6F' },
      { name: '健身', slug: 'fitness', color: '#BB8FCE' },
      { name: '时政', slug: 'politics', color: '#85C1E2' },
      { name: '美食', slug: 'food', color: '#F8B739' },
      { name: '旅行', slug: 'travel', color: '#52BE80' },
      { name: '摄影', slug: 'photography', color: '#5DADE2' },
    ];

    // 为其他分类分配标签
    for (const subCat of subCategories.filter((cat) => !techSubCategories.includes(cat))) {
      const relevantTags = otherTags.filter(
        (t) => subCat.slug.includes(t.slug) || t.slug.includes(subCat.slug.split('-')[0]),
      );

      for (const tagData of relevantTags.slice(0, 3)) {
        // 如果标签名称已存在，跳过（避免重复）
        if (createdTagNames.has(tagData.name)) {
          continue;
        }

        const tag = tagRepository.create({
          name: tagData.name,
          slug: tagData.slug,
          color: tagData.color,
          categoryId: subCat.id,
        });
        tags.push(tag);
        createdTagNames.add(tagData.name);
      }
    }

    // 添加一些未分类的通用标签
    const uncategorizedTags = [
      { name: '热门', slug: 'hot', color: '#E74C3C' },
      { name: '推荐', slug: 'recommended', color: '#3498DB' },
      { name: '精华', slug: 'featured', color: '#F39C12' },
    ];

    for (const tagData of uncategorizedTags) {
      // 如果标签名称已存在，跳过（避免重复）
      if (createdTagNames.has(tagData.name)) {
        continue;
      }

      const tag = tagRepository.create({
        ...tagData,
        categoryId: null,
      });
      tags.push(tag);
      createdTagNames.add(tagData.name);
    }

    await tagRepository.save(tags);
    console.log(`✅ 创建了 ${tags.length} 个标签（已关联到分类）`);

    // 5. 创建文章（1000篇）
    console.log('📝 创建文章...');
    const posts: Post[] = [];
    const topics = [
      'React',
      'Vue',
      'Node.js',
      'TypeScript',
      'Python',
      'Java',
      'Go',
      'Docker',
      'Kubernetes',
      'Redis',
    ];

    for (let i = 0; i < 1000; i++) {
      const topic = randomChoice(topics);
      const template = randomChoice(articleTemplates);
      const title = template.replace('{topic}', topic);
      const slug = `${title.toLowerCase().replace(/\s+/g, '-')}-${i}`;
      const contentTemplate = randomChoice(contentTemplates);
      const content = contentTemplate.replace(/{title}/g, title).replace(/{topic}/g, topic);

      const author = randomChoice(allUsers);
      // 优先选择子分类，如果没有则选择大类
      const subCategories = allCategories.filter((cat) => cat.level === 1);
      const category =
        subCategories.length > 0 ? randomChoice(subCategories) : randomChoice(mainCategories);
      // 选择与分类相关的标签，如果没有则随机选择
      const categoryTags = tags.filter((t) => t.categoryId === category.id);
      const selectedTags =
        categoryTags.length > 0
          ? randomChoices(categoryTags, randomInt(2, Math.min(5, categoryTags.length)))
          : randomChoices(tags, randomInt(2, 5));
      const publishedAt = randomDate(365); // 过去一年内

      const post = postRepository.create({
        title,
        slug,
        summary: `这是一篇关于 ${topic} 的文章，将深入探讨相关技术点。`,
        content,
        coverImage: `https://picsum.photos/800/400?random=${i}`,
        status: Math.random() > 0.2 ? PostStatus.PUBLISHED : PostStatus.DRAFT,
        publishedAt: Math.random() > 0.2 ? publishedAt : null,
        viewCount: randomInt(0, 5000),
        likeCount: 0, // 稍后通过点赞数据更新
        commentCount: 0, // 稍后通过评论数据更新
        favoriteCount: 0, // 稍后通过收藏数据更新
        isFeatured: Math.random() > 0.9,
        isTop: Math.random() > 0.95,
        author,
        category,
        tags: selectedTags,
      });

      posts.push(post);

      // 批量保存
      if (posts.length >= batchSize) {
        await postRepository.save(posts);
        console.log(`  已创建 ${i + 1} 篇文章...`);
        posts.length = 0;
      }
    }

    if (posts.length > 0) {
      await postRepository.save(posts);
    }

    const allPosts = await postRepository.find({ where: { status: PostStatus.PUBLISHED } });
    console.log(`✅ 创建了 ${allPosts.length} 篇已发布文章`);

    // 6. 创建评论（每篇文章 0-10 条）
    console.log('📝 创建评论...');
    const comments: Comment[] = [];
    let commentCount = 0;

    for (const post of allPosts) {
      const commentNum = randomInt(0, 10);
      for (let i = 0; i < commentNum; i++) {
        const comment = commentRepository.create({
          content: randomChoice(commentTemplates),
          status: Math.random() > 0.1 ? CommentStatus.APPROVED : CommentStatus.PENDING,
          user: randomChoice(allUsers),
          post,
          likeCount: randomInt(0, 50),
          createdAt: randomDate(30),
        });
        comments.push(comment);
        commentCount++;

        if (comments.length >= batchSize) {
          await commentRepository.save(comments);
          comments.length = 0;
        }
      }
    }

    if (comments.length > 0) {
      await commentRepository.save(comments);
    }
    console.log(`✅ 创建了 ${commentCount} 条评论`);

    // 7. 创建点赞（文章和评论）
    console.log('📝 创建点赞数据...');
    const likes: Like[] = [];
    let likeCount = 0;

    // 文章点赞
    for (const post of allPosts) {
      const likeNum = randomInt(0, 200);
      const likers = randomChoices(allUsers, likeNum);
      for (const liker of likers) {
        const like = likeRepository.create({
          user: liker,
          targetType: LikeType.POST,
          targetId: post.id,
          post,
        });
        likes.push(like);
        likeCount++;

        if (likes.length >= batchSize) {
          await likeRepository.save(likes);
          likes.length = 0;
        }
      }
    }

    // 评论点赞
    const allComments = await commentRepository.find();
    for (const comment of allComments) {
      if (Math.random() > 0.7) {
        const likeNum = randomInt(0, 20);
        const likers = randomChoices(allUsers, likeNum);
        for (const liker of likers) {
          const like = likeRepository.create({
            user: liker,
            targetType: LikeType.COMMENT,
            targetId: comment.id,
            comment,
          });
          likes.push(like);
          likeCount++;

          if (likes.length >= batchSize) {
            await likeRepository.save(likes);
            likes.length = 0;
          }
        }
      }
    }

    if (likes.length > 0) {
      await likeRepository.save(likes);
    }
    console.log(`✅ 创建了 ${likeCount} 个点赞`);

    // 8. 创建收藏
    console.log('📝 创建收藏数据...');
    const favorites: Favorite[] = [];
    let favoriteCount = 0;

    for (const post of allPosts) {
      if (Math.random() > 0.5) {
        const favoriteNum = randomInt(0, 100);
        const favoriters = randomChoices(allUsers, favoriteNum);
        for (const favoriter of favoriters) {
          const favorite = favoriteRepository.create({
            user: favoriter,
            post,
          });
          favorites.push(favorite);
          favoriteCount++;

          if (favorites.length >= batchSize) {
            await favoriteRepository.save(favorites);
            favorites.length = 0;
          }
        }
      }
    }

    if (favorites.length > 0) {
      await favoriteRepository.save(favorites);
    }
    console.log(`✅ 创建了 ${favoriteCount} 个收藏`);

    // 9. 创建关注关系
    console.log('📝 创建关注关系...');
    const follows: Follow[] = [];
    let followCount = 0;

    for (const user of allUsers) {
      const followNum = randomInt(0, 50);
      const followings = randomChoices(
        allUsers.filter((u) => u.id !== user.id),
        followNum,
      );
      for (const following of followings) {
        const follow = followRepository.create({
          follower: user,
          following,
        });
        follows.push(follow);
        followCount++;

        if (follows.length >= batchSize) {
          await followRepository.save(follows);
          follows.length = 0;
        }
      }
    }

    if (follows.length > 0) {
      await followRepository.save(follows);
    }
    console.log(`✅ 创建了 ${followCount} 个关注关系`);

    // 10. 更新统计数据
    console.log('📝 更新统计数据...');

    // 更新文章统计（批量更新以提高性能）
    console.log('  更新文章统计数据...');
    const postStats = await Promise.all(
      allPosts.map(async (post) => {
        const [postLikes, postComments, postFavorites] = await Promise.all([
          likeRepository.count({
            where: { targetType: LikeType.POST, targetId: post.id },
          }),
          commentRepository.count({
            where: { post: { id: post.id } },
          }),
          favoriteRepository.count({
            where: { post: { id: post.id } },
          }),
        ]);
        return { post, postLikes, postComments, postFavorites };
      }),
    );

    for (const { post, postLikes, postComments, postFavorites } of postStats) {
      post.likeCount = postLikes;
      post.commentCount = postComments;
      post.favoriteCount = postFavorites;
    }
    await postRepository.save(allPosts);

    // 更新用户统计（批量更新以提高性能）
    console.log('  更新用户统计数据...');
    const userStats = await Promise.all(
      allUsers.map(async (user) => {
        const [userPosts, userFollowers, userFollowings] = await Promise.all([
          postRepository.count({
            where: { author: { id: user.id }, status: PostStatus.PUBLISHED },
          }),
          followRepository.count({
            where: { following: { id: user.id } },
          }),
          followRepository.count({
            where: { follower: { id: user.id } },
          }),
        ]);
        return { user, userPosts, userFollowers, userFollowings };
      }),
    );

    for (const { user, userPosts, userFollowers, userFollowings } of userStats) {
      const profile = profiles.find((p) => p.user.id === user.id);
      if (profile) {
        profile.articleCount = userPosts;
        profile.followerCount = userFollowers;
        profile.followingCount = userFollowings;
      }
    }
    await userProfileRepository.save(profiles);

    console.log('✅ 数据生成完成！');
    console.log(`- 用户: ${allUsers.length} 个`);
    console.log(
      `- 分类: ${allCategories.length} 个（${mainCategories.length} 个大类 + ${allCategories.length - mainCategories.length} 个子分类）`,
    );
    console.log(`- 标签: ${tags.length} 个（已关联到分类）`);
    console.log(`- 文章: ${allPosts.length} 篇`);
    console.log(`- 评论: ${commentCount} 条`);
    console.log(`- 点赞: ${likeCount} 个`);
    console.log(`- 收藏: ${favoriteCount} 个`);
    console.log(`- 关注: ${followCount} 个`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ 数据生成失败:', error);
    process.exit(1);
  }
}

generateLargeData();
