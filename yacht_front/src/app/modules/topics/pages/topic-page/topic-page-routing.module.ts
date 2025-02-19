import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TopicPageComponent } from './topic-page.component';
import { TopicsResolverService } from '@shared/services/topics-resolver.service';
import { FeedResolverService } from '@shared/services/feed-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: TopicPageComponent,
    resolve: { data: TopicsResolverService, feed: FeedResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopicPageRoutingModule { }
