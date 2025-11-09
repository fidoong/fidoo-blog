'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { postsApi } from '@/lib/api/posts';
import { categoriesApi } from '@/lib/api/categories';
import { tagsApi } from '@/lib/api/tags';
import { useAuthStore } from '@/store/auth';
import { Folder } from 'lucide-react';
import { toast } from 'sonner';
import { MarkdownEditor } from '@/components/post/MarkdownEditor';
import { AuthModal } from '@/components/auth/AuthModal';
import { PostFormToolbar } from '@/components/forms/PostFormToolbar';
import { PostFormSection } from '@/components/forms/PostFormSection';
import { FormInput, FormTextarea, FormSelect } from '@/components/forms/FormField';
import { TagSelector } from '@/components/forms/TagSelector';
import { CoverImagePreview } from '@/components/forms/CoverImagePreview';
import { PublishOptions } from '@/components/forms/PublishOptions';
import { FadeIn } from '@/components/ui/animation';
import type { CreatePostDto } from '@/lib/api/types';

// 表单验证 schema
const postSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符'),
  slug: z
    .string()
    .min(1, 'URL别名不能为空')
    .max(200, 'URL别名不能超过200个字符')
    .regex(/^[a-z0-9-]+$/, 'URL别名只能包含小写字母、数字和连字符'),
  summary: z.string().max(500, '摘要不能超过500个字符').optional(),
  content: z.string().min(1, '内容不能为空'),
  coverImage: z.string().url('封面图片必须是有效的URL').optional().or(z.literal('')),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  isFeatured: z.boolean().default(false),
  isTop: z.boolean().default(false),
});

type PostFormData = z.infer<typeof postSchema>;

export default function CreatePostPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // 等待 store 恢复完成后再检查登录状态
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      setLoginModalOpen(true);
    }
  }, [isAuthenticated, _hasHydrated]);

  // 获取分类和标签
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
    enabled: isAuthenticated,
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getTags(),
    enabled: isAuthenticated,
  });

  const categories = categoriesData || [];
  const tags = tagsData || [];

  // 表单
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      slug: '',
      summary: '',
      content: '',
      coverImage: '',
      categoryId: '',
      tagIds: [],
      status: 'draft',
      isFeatured: false,
      isTop: false,
    },
  });

  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');
  const watchedTagIds = watch('tagIds') || [];
  const watchedStatus = watch('status');
  const watchedCoverImage = watch('coverImage');

  // 根据标题自动生成 slug
  useEffect(() => {
    if (watchedTitle && !watchedSlug) {
      const autoSlug = watchedTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', autoSlug);
    }
  }, [watchedTitle, watchedSlug, setValue]);

  // 创建文章 mutation
  const createPostMutation = useMutation({
    mutationFn: (data: CreatePostDto) => postsApi.createPost(data),
    onSuccess: (post) => {
      toast.success('文章创建成功');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      router.push(`/posts/${post.slug}`);
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };

      if (err?.response?.status === 403) {
        toast.error('权限不足，您没有创建文章的权限');
      } else if (err?.response?.status === 401) {
        toast.error('登录已过期，请重新登录');
        setLoginModalOpen(true);
      } else {
        toast.error(err?.response?.data?.message || err?.message || '创建失败，请稍后重试');
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // 提交表单
  const onSubmit = async (data: PostFormData) => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }

    setIsSubmitting(true);

    const postData: CreatePostDto = {
      title: data.title,
      slug: data.slug,
      summary: data.summary || undefined,
      content: data.content,
      coverImage: data.coverImage || undefined,
      categoryId: data.categoryId || undefined,
      tagIds: data.tagIds && data.tagIds.length > 0 ? data.tagIds : undefined,
      status: data.status,
      isFeatured: data.isFeatured,
      isTop: data.isTop,
    };

    createPostMutation.mutate(postData);
  };

  // 处理标签选择
  const handleTagToggle = (tagId: string) => {
    const currentTagIds = watchedTagIds;
    if (currentTagIds.includes(tagId)) {
      setValue(
        'tagIds',
        currentTagIds.filter((id) => id !== tagId),
      );
    } else {
      setValue('tagIds', [...currentTagIds, tagId]);
    }
  };

  // 等待 store 恢复完成
  if (!_hasHydrated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <AuthModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      {!isAuthenticated && (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center py-16">
            <p className="text-gray-600 mb-4">请先登录后再创建文章</p>
          </div>
        </div>
      )}
      {isAuthenticated && (
        <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
          <PostFormToolbar isSubmitting={isSubmitting} onSubmit={handleSubmit(onSubmit)} />

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              <form id="post-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FadeIn>
                  <PostFormSection title="基本信息">
                    <FormInput
                      label="标题"
                      {...register('title')}
                      placeholder="输入文章标题..."
                      error={errors.title?.message}
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL 别名 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 whitespace-nowrap">/posts/</span>
                        <FormInput
                          label=""
                          {...register('slug')}
                          placeholder="url-alias"
                          error={errors.slug?.message}
                          helperText="只能包含小写字母、数字和连字符"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <FormTextarea
                      label="摘要"
                      {...register('summary')}
                      rows={3}
                      placeholder="输入文章摘要（可选）..."
                      error={errors.summary?.message}
                      helperText="摘要将显示在文章列表和分享卡片中"
                    />

                    <CoverImagePreview
                      value={watchedCoverImage || ''}
                      onChange={(value) => setValue('coverImage', value)}
                      error={errors.coverImage?.message}
                    />
                  </PostFormSection>
                </FadeIn>

                <FadeIn delay={100}>
                  <PostFormSection title="分类与标签" icon={<Folder className="h-5 w-5" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormSelect
                        label="分类"
                        {...register('categoryId')}
                        options={[
                          { value: '', label: '选择分类（可选）' },
                          ...categories.map((cat) => ({
                            value: cat.id,
                            label: cat.name,
                          })),
                        ]}
                      />

                      <TagSelector
                        tags={tags}
                        selectedTagIds={watchedTagIds}
                        onToggle={handleTagToggle}
                      />
                    </div>
                  </PostFormSection>
                </FadeIn>

                <FadeIn delay={200}>
                  <PostFormSection title="内容">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        内容 <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500">
                        支持 Markdown 格式，支持代码高亮、表格、任务列表等
                      </p>
                    </div>
                    <MarkdownEditor
                      value={watch('content')}
                      onChange={(value) => setValue('content', value)}
                      placeholder="使用 Markdown 格式编写文章内容..."
                      minHeight="500px"
                    />
                    {errors.content && (
                      <p className="mt-2 text-sm text-red-600">{errors.content.message}</p>
                    )}
                  </PostFormSection>
                </FadeIn>

                <FadeIn delay={300}>
                  <PostFormSection title="发布设置">
                    <PublishOptions
                      statusRegister={register('status')}
                      isFeaturedRegister={register('isFeatured')}
                      isTopRegister={register('isTop')}
                      statusValue={watchedStatus}
                    />
                  </PostFormSection>
                </FadeIn>
              </form>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
