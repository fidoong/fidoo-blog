'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import {
  Edit,
  Eye,
  Split,
  Maximize2,
  Minimize2,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Code,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Quote,
} from 'lucide-react';
import 'highlight.js/styles/github.css';

type ViewMode = 'edit' | 'preview' | 'split';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = '使用 Markdown 格式编写文章内容...',
  minHeight = '600px',
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  // 同步滚动
  const handleEditorScroll = () => {
    if (viewMode !== 'split' || !editorScrollRef.current || !previewScrollRef.current) return;

    const editor = editorScrollRef.current;
    const preview = previewScrollRef.current;

    const editorScrollRatio =
      editor.scrollTop / Math.max(editor.scrollHeight - editor.clientHeight, 1);
    const previewMaxScroll = Math.max(preview.scrollHeight - preview.clientHeight, 1);

    preview.scrollTop = editorScrollRatio * previewMaxScroll;
  };

  // 处理 Tab 键缩进
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // 插入 Markdown 语法
  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    if (!editorRef.current) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const insertText = selectedText || placeholder;

    const newValue =
      value.substring(0, start) + before + insertText + after + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        // 如果有选中文本，选中整个插入的内容
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + insertText.length,
        );
      } else {
        // 如果没有选中文本，光标放在占位符中间
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + insertText.length,
        );
      }
    }, 0);
  };

  // 工具栏按钮
  const toolbarButtons = [
    {
      icon: Heading1,
      label: '标题1',
      action: () => insertMarkdown('# ', '', '标题'),
    },
    {
      icon: Heading2,
      label: '标题2',
      action: () => insertMarkdown('## ', '', '标题'),
    },
    {
      icon: Bold,
      label: '粗体',
      action: () => insertMarkdown('**', '**', '粗体文本'),
    },
    {
      icon: Italic,
      label: '斜体',
      action: () => insertMarkdown('*', '*', '斜体文本'),
    },
    {
      icon: Code,
      label: '代码',
      action: () => insertMarkdown('`', '`', '代码'),
    },
    {
      icon: LinkIcon,
      label: '链接',
      action: () => insertMarkdown('[', '](url)', '链接文本'),
    },
    {
      icon: ImageIcon,
      label: '图片',
      action: () => insertMarkdown('![', '](url)', '图片描述'),
    },
    {
      icon: List,
      label: '列表',
      action: () => insertMarkdown('- ', '', '列表项'),
    },
    {
      icon: Quote,
      label: '引用',
      action: () => insertMarkdown('> ', '', '引用内容'),
    },
  ];

  // 全屏切换
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const toolbarHeight = viewMode === 'preview' ? 49 : 98;

  return (
    <div
      className={`border border-gray-300 rounded-lg overflow-hidden bg-white flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : 'relative'
      }`}
      style={{
        height: isFullscreen ? '100vh' : minHeight,
      }}
    >
      {/* 工具栏 */}
      <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
        {/* 视图切换栏 */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
                viewMode === 'edit'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Edit className="h-4 w-4" />
              编辑
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
                viewMode === 'split'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Split className="h-4 w-4" />
              分屏
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
                viewMode === 'preview'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye className="h-4 w-4" />
              预览
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Markdown 快捷工具栏 */}
        {viewMode !== 'preview' && (
          <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
            {toolbarButtons.map((btn, index) => {
              const Icon = btn.icon;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={btn.action}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title={btn.label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 编辑器内容区域 */}
      <div
        className="flex flex-1 min-h-0"
        style={{
          height: `calc(100% - ${toolbarHeight}px)`,
        }}
      >
        {/* 编辑区域 */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div
            className={`relative flex flex-col h-full ${
              viewMode === 'split' ? 'w-1/2 border-r border-gray-200' : 'w-full'
            }`}
          >
            <div
              ref={editorScrollRef}
              onScroll={handleEditorScroll}
              className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
              style={{ minHeight: 0, maxHeight: '100%' }}
            >
              <textarea
                ref={editorRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full px-4 py-3 font-mono text-sm resize-none border-0 focus:outline-none focus:ring-0"
                style={{ minHeight: '100%', display: 'block' }}
              />
            </div>
            {viewMode === 'split' && (
              <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded z-10 pointer-events-none">
                行数: {value.split('\n').length}
              </div>
            )}
          </div>
        )}

        {/* 预览区域 */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`flex flex-col h-full ${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <div
              ref={previewScrollRef}
              className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white"
              style={{ minHeight: 0, maxHeight: '100%' }}
            >
              <div className="px-4 py-3">
                {value.trim() ? (
                  <div className="markdown-content prose prose-slate max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    >
                      {value}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>预览内容将显示在这里</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

