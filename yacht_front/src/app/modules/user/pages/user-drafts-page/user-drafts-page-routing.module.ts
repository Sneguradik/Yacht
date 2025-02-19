import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserDraftsPageComponent } from './user-drafts-page.component';
import { PublicationStageEnum } from '@api/schemas/article/publication-stage.enum';
import { UsersResolverService } from '@shared/services/users-resolver.service';


const routes: Routes = [
  {
    path: '',
    component: UserDraftsPageComponent,
    data: {
      query: {
        stage: [PublicationStageEnum[PublicationStageEnum.DRAFT]],
      },
    },
    resolve: { data: UsersResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserDraftsPageRoutingModule { }
