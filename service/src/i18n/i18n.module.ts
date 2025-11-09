import { Module } from '@nestjs/common';
import { I18nModule, I18nJsonLoader, QueryResolver, HeaderResolver, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'zh-CN',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(process.cwd(), 'src/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang', 'locale', 'l'] },
        new HeaderResolver(['x-custom-lang']),
        AcceptLanguageResolver,
      ],
    }),
  ],
})
export class AppI18nModule {}

