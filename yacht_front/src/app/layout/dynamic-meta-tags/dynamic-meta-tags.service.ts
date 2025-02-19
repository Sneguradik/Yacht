import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { IMetaInfo } from './meta-info.interface';
import { AdministrationService } from '@api/routes/administration.service';
import { IPreviewManagementView } from '@api/schemas/dashboard/preview-management-view.interface';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class DynamicMetaTagsService {
  private default: IMetaInfo;

  public readonly metaInfo$: ReplaySubject<IMetaInfo> = new ReplaySubject<IMetaInfo>(1);

  constructor(private readonly administrationService: AdministrationService, private readonly router: Router) {
    this.administrationService.getPreview$().subscribe((preview: IPreviewManagementView) => {
      this.default = {
        title: preview.title,
        tags: [
          { property: 'og:title', content: preview.title },
          { name: 'description', content: preview.description },
          { property: 'og:description', content: preview.description },
          { property: 'og:image', content: preview.image },
          { property: 'og:url', content: preview.siteName },
          { property: 'og:type', content: 'website' },
          { property: 'og:site_name', content: 'Diskurs.Media' },
          { name: 'twitter:card', content: 'summary' },
          { name: 'twitter:title', content: preview.title },
          { name: 'twitter:description', content: preview.description },
          { name: 'twitter:image', content: preview.image }
        ]
      };
      const isSpecialUrl: boolean = this.router.url.includes('/news/') || this.router.url.includes('/user/')
        || this.router.url.includes('/company/') || this.router.url.includes('/jobs/')
        || this.router.url.includes('/events/') || this.router.url.includes('/topics/');
      if (!isSpecialUrl) {
        this.metaInfo$.next(this.default);
      }
    });
  }

  public setToDefault(): void {
    this.metaInfo$.next(this.default);
  }
}
