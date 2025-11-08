import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">关于我们</h3>
            <p className="text-sm text-gray-600">
              Fidoo Blog 是一个技术博客社区，致力于分享优质的技术内容。
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-primary-600">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary-600">
                  分类
                </Link>
              </li>
              <li>
                <Link href="/tags" className="hover:text-primary-600">
                  标签
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">社区</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-primary-600">
                  关于
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-600">
                  联系我们
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">关注我们</h3>
            <p className="text-sm text-gray-600">关注我们的社交媒体，获取最新动态。</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Fidoo Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
