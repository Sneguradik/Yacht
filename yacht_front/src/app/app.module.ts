import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LayoutModule } from './layout/layout.module';
import { I18nModule } from '@app/modules/i18n/i18n.module';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { CookieService } from 'ngx-cookie-service';
import { NgxsModule } from '@ngxs/store';

import localeRu from '@angular/common/locales/ru';
import { registerLocaleData } from '@angular/common';
import { environment } from '@env';
import { UserStatsState } from '@app/store/user-stats/user-stats.state';
registerLocaleData(localeRu, 'ru');

export function HttpLoaderFactory(httpClient: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(httpClient, (environment.production ? environment.url : '') + '/assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    HttpClientModule,
    I18nModule,
    TransferHttpCacheModule,
    BrowserTransferStateModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    LayoutModule,
    NgxsModule.forRoot([UserStatsState], {
      developmentMode: !environment.production
    })
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'ru' },
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
