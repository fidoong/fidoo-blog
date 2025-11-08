import { MainLayout } from '@/components/layout/MainLayout';

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">关于我们</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-7 mb-6">
              Fidoo Blog 是一个现代化的技术博客社区，致力于为开发者提供优质的技术内容分享平台。
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">我们的使命</h2>
            <p className="text-gray-700 leading-7 mb-6">
              通过技术分享，连接开发者社区，推动技术知识的传播和创新。
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">技术栈</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>前端：Next.js 14, React, TypeScript, TailwindCSS</li>
              <li>后端：NestJS, TypeORM, PostgreSQL</li>
              <li>其他：Redis, Docker, CI/CD</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
