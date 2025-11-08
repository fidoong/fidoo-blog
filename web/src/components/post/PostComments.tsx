'use client';

import { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { commentsApi } from '@/lib/api/comments';
import { useAuthStore } from '@/store/auth';
import { formatRelativeTime } from '@/lib/utils/format';
import { MessageCircle, Send, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PostCommentsProps {
  postId: string;
}

export function PostComments({ postId }: PostCommentsProps) {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [parentId, setParentId] = useState<string | undefined>();
  const parentRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentsApi.getPostComments(postId, 'approved'),
    retry: (failureCount, error: any) => {
      // 如果是 401 错误，不重试
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const createMutation = useMutation({
    mutationFn: (content: string) =>
      commentsApi.createComment({
        content,
        postId,
        parentId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setComment('');
      setParentId(undefined);
    },
  });

  const comments = useMemo(() => data?.data || [], [data?.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !isAuthenticated) return;
    createMutation.mutate(comment);
  };

  const renderComment = (comment: any) => {
    const level = comment.level || 0;
    return (
      <div className={level > 0 ? 'ml-8 mt-4' : 'mt-6'}>
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {comment.user.avatar ? (
              <Image
                src={comment.user.avatar}
                alt={comment.user.nickname || comment.user.username}
                width={40}
                height={40}
                loading="lazy"
                className="rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-5 w-5 text-primary-600" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/users/${comment.user.username}`}
                className="font-medium text-gray-900 hover:text-primary-600"
              >
                {comment.user.nickname || comment.user.username}
              </Link>
              <span className="text-sm text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
            </div>
            <p className="text-gray-700 mb-2 whitespace-pre-wrap">{comment.content}</p>
            {isAuthenticated && level < 2 && (
              <button
                onClick={() => setParentId(comment.id)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                回复
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 构建评论树（扁平化，包含所有层级的评论）
  const buildCommentTree = (comments: any[]): any[] => {
    const map = new Map();
    const roots: any[] = [];

    comments.forEach((comment) => {
      map.set(comment.id, { ...comment, children: [] });
    });

    comments.forEach((comment) => {
      const node = map.get(comment.id);
      if (comment.parent) {
        const parent = map.get(comment.parent.id);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    // 扁平化树结构，用于虚拟滚动
    const flattenTree = (nodes: any[], level = 0): any[] => {
      const result: any[] = [];
      nodes.forEach((node) => {
        result.push({ ...node, level });
        if (node.children && node.children.length > 0) {
          result.push(...flattenTree(node.children, level + 1));
        }
      });
      return result;
    };

    return flattenTree(roots);
  };

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  // 虚拟滚动配置
  const virtualizer = useVirtualizer({
    count: commentTree.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const comment = commentTree[index];
      // 根据评论层级和内容长度估算高度
      const baseHeight = 120;
      const levelOffset = (comment.level || 0) * 20;
      const contentHeight = Math.ceil((comment.content?.length || 0) / 50) * 20;
      return baseHeight + levelOffset + contentHeight;
    },
    overscan: 5,
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-primary-600" />
        评论 ({comments.length})
      </h2>

      {/* 评论表单 */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.nickname || user.username}
                  width={40}
                  height={40}
                  loading="lazy"
                  className="rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={parentId ? '回复评论...' : '写下你的评论...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={4}
              />
              {parentId && (
                <div className="mt-2 text-sm text-gray-500">
                  正在回复评论，{' '}
                  <button
                    onClick={() => setParentId(undefined)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    取消
                  </button>
                </div>
              )}
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!comment.trim() || createMutation.isPending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {createMutation.isPending ? '发送中...' : '发送'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center text-gray-600">
          请{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700">
            登录
          </Link>{' '}
          后发表评论
        </div>
      )}

      {/* 评论列表 - 使用虚拟滚动 */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : commentTree.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无评论</div>
      ) : (
        <div ref={parentRef} className="h-[600px] overflow-auto" style={{ contain: 'strict' }}>
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const comment = commentTree[virtualItem.index];
              return (
                <div
                  key={comment.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {renderComment(comment)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
