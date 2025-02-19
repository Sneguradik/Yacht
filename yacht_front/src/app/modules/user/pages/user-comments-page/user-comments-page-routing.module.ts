import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserCommentsPageComponent } from './user-comments-page.component';
import { UsersResolverService } from '@shared/services/users-resolver.service';


const routes: Routes = [
  {
    path: '',
    component: UserCommentsPageComponent,
    resolve: { data: UsersResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserCommentsPageRoutingModule { }
