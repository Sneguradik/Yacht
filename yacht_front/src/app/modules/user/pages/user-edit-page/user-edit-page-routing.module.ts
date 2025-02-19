import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserEditPageComponent } from './user-edit-page.component';
import { UsersResolverService } from '@shared/services/users-resolver.service';


const routes: Routes = [
  {
    path: '',
    component: UserEditPageComponent,
    resolve: { data: UsersResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserEditPageRoutingModule { }
