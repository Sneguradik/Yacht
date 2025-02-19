import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllPageComponent } from './all-page.component';
import { FeedResolverService } from '@shared/services/feed-resolver.service';


const routes: Routes = [
  {
    path: '',
    component: AllPageComponent,
    resolve: { feed: FeedResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllPageRoutingModule { }
