import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment } from '@env';
import { BLOCKER_ROUTES, DEFAULT_ROUTES } from './routes.const';


const routes: Routes = environment.blocker ? BLOCKER_ROUTES : DEFAULT_ROUTES;

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy', initialNavigation: 'enabled', anchorScrolling: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
