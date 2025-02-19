import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserPromotedPageComponent } from './user-promoted-page.component';
import { UsersResolverService } from '@shared/services/users-resolver.service';


const routes: Routes = [
  {
    path: '',
    component: UserPromotedPageComponent,
    data: {
      query: {
        bookmark: true,
      },
    },
    resolve: { data: UsersResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserPromotedPageRoutingModule { }
