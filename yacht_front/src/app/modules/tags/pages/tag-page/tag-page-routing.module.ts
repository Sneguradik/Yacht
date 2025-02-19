import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TagPageComponent } from './tag-page.component';
import { FeedResolverService } from '@shared/services/feed-resolver.service';


const routes: Routes = [
  {
    path: '',
    component: TagPageComponent,
    resolve: { feed: FeedResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TagPageRoutingModule { }
