import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateCacheModule, TranslateCacheService, TranslateCacheSettings } from 'ngx-translate-cache';
import { PlatformService } from '@shared/services/platform.service';
import { translateLoaderFactory } from './functions/translate-loader-factory.function';
import { translateCacheFactory } from './functions/translate-cache-factory.function';

@NgModule({
  imports: [
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateLoaderFactory,
        deps: [HttpClient],
      },
    }),
    TranslateCacheModule.forRoot({
      cacheService: {
        provide: TranslateCacheService,
        useFactory: translateCacheFactory,
        deps: [TranslateService, TranslateCacheSettings],
      },
      cacheMechanism: 'Cookie',
    }),
  ],
  exports: [TranslateModule],
})
export class I18nModule {
  constructor(
    private readonly translate: TranslateService,
    private readonly translateCacheService: TranslateCacheService,
    private readonly platformService: PlatformService
  ) {
    this.translateCacheService.init();
    this.translate.addLangs(['en', 'ru']);
    this.translate.setDefaultLang('ru');
    const browserLang = this.translateCacheService.getCachedLanguage() || this.translate.getBrowserLang();
    this.translate.use(this.platformService.isBrowser ? (browserLang.match(/en|ru/) ? browserLang : 'en') : 'ru');
  }
}
