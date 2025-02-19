import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserEventsPageComponent } from './user-events-page.component';
import { UsersResolverService } from '@shared/services/users-resolver.service';


const routes: Routes = [
  {
    path: '',
    component: UserEventsPageComponent,
    resolve: { data: UsersResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserEventsPageRoutingModule { }
