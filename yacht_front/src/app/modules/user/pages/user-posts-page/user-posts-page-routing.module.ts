import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserPostsPageComponent } from './user-posts-page.component';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { UsersResolverService } from '@shared/services/users-resolver.service';
import { FeedResolverService } from '@shared/services/feed-resolver.service';


const routes: Routes = [
  {
    path: '',
    component: UserPostsPageComponent,
    data: {
      query: {
        stage: [
          PublicationStageEnum[PublicationStageEnum.PUBLISHED],
          PublicationStageEnum[PublicationStageEnum.REVIEWING],
          PublicationStageEnum[PublicationStageEnum.BLOCKED]],
      },
    },
    resolve: { data: UsersResolverService, feed: FeedResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserPostsPageRoutingModule { }
