import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserInfoPageComponent } from './user-info-page.component';
import { UsersResolverService } from '@shared/services/users-resolver.service';


const routes: Routes = [
  {
    path: '',
    component: UserInfoPageComponent,
    resolve: { data: UsersResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserInfoPageRoutingModule { }
