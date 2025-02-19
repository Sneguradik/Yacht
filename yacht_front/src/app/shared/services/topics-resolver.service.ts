import { Injectable } from '@angular/core';
import { ITopicViewFull } from '@api/schemas/topic/topic-view-full.interface';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { TopicsService } from '@api/routes/topics.service';
import { Observable } from 'rxjs';
import { notFound } from '@shared/utils/not-found.operator';

@Injectable({
  providedIn: 'root'
})
export class TopicsResolverService implements Resolve<ITopicViewFull> {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<ITopicViewFull> {
    return this.topicsService.getOne$(route.params.id).pipe(notFound(this.router));
  }
}
