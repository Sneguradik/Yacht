import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserNotificationsPageComponent } from './user-notifications-page.component';
import { UsersResolverService } from '@shared/services/users-resolver.service';


const routes: Routes = [
  {
    path: '',
    component: UserNotificationsPageComponent,
    resolve: { data: UsersResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserNotificationsPageRoutingModule { }
