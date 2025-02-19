import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewsPageComponent } from './news-page.component';
import { ArticlesResolverService } from '@shared/services/articles-resolver.service';


const routes: Routes = [
  {
    path: '',
    component: NewsPageComponent,
    resolve: { data: ArticlesResolverService },
  },
  {
    path: ':slug',
    component: NewsPageComponent,
    resolve: { data: ArticlesResolverService },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsPageRoutingModule { }
