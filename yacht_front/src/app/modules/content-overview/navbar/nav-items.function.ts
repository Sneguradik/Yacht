import { INavItem } from './nav-item.interface';
import { TranslateService } from '@ngx-translate/core';

export function navItems(translateService: TranslateService): INavItem[] {
    return [
        {
            title: translateService.instant('COMMON.MAIN_TOPICS'),
            url: '/topics',
        },
        {
            title: translateService.instant('COMMON.AUTHORS'),
            url: '/authors',
        },
        {
            title: translateService.instant('COMMON.COMPANIES'),
            url: '/companies',
        },
        {
            title: translateService.instant('COMMON.TAGS_'),
            url: '/tags',
        },
    ];
}
