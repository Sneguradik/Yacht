import { NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { CookieService } from 'ngx-cookie-service';
import { CookiesServerService } from '@app/services/cookies-server.service';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    ServerTransferStateModule
  ],
  providers: [
    {
      provide: CookieService,
      useClass: CookiesServerService
    }
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
