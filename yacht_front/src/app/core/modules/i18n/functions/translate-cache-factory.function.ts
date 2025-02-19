import { TranslateCacheService, TranslateCacheSettings } from 'ngx-translate-cache';
import { TranslateService } from '@ngx-translate/core';

export function translateCacheFactory(translateService: TranslateService,
                                      translateCacheSettings: TranslateCacheSettings): TranslateCacheService {
    return new TranslateCacheService(translateService, translateCacheSettings);
}
