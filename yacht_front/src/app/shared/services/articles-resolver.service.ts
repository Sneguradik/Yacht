import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { IArticleViewFull } from '@api/schemas/article/article-view-full.interface';
import { ArticlesService } from '@api/routes/articles.service';
import { Observable, of } from 'rxjs';
import { notFound } from '@shared/utils/not-found.operator';
import { PlatformService } from './platform.service';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ArticlesResolverService implements Resolve<IArticleViewFull> {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly router: Router,
    private readonly platformService: PlatformService,
    private readonly transferState: TransferState
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<IArticleViewFull> {
    const ARTICLE_KEY = makeStateKey<IArticleViewFull>('article-' + route.params.id);
    if (this.transferState.hasKey(ARTICLE_KEY)) {
      const article = this.transferState.get<IArticleViewFull>(ARTICLE_KEY, null);
      this.transferState.remove(ARTICLE_KEY);
      return of(article);
    } else {
      return this.articlesService.getSingle$(route.params.id).pipe(
        notFound(this.router),
        tap((article: IArticleViewFull) => {
          if (this.platformService.isServer) {
            this.transferState.set(ARTICLE_KEY, article);
          }
        })
      );
    }
  }
}
