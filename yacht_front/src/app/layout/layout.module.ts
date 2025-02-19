import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { LoginFormComponent } from './header/login-form/login-form.component';
import { SearchBoxComponent } from './header/search-box/search-box.component';
import { UserDropdownComponent } from './header/user-dropdown/user-dropdown.component';
import { LoginSocialConnectComponent } from './login-social-connect/login-social-connect.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedComponentsModule } from '@shared/components/shared-components.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedPipesModule } from '@shared/pipes/shared-pipes.module';
import { SharedUiModule } from '@shared/ui/shared-ui.module';
import { LayoutComponent } from '@layout/layout.component';
import { DynamicMetaTagsComponent } from './dynamic-meta-tags/dynamic-meta-tags.component';
import { SidebarWrapperComponent } from './sidebar-wrapper/sidebar-wrapper.component';
import { FeedNavComponent } from './shared/components/feed-nav/feed-nav.component';
import { FeedNavItemComponent } from './shared/components/feed-nav/feed-nav-item/feed-nav-item.component';
import { ToolbarComponent } from './shared/components/toolbar/toolbar.component';
import { TrendingSidebarComponent } from './sidebar-wrapper/trending-sidebar/trending-sidebar.component';
import { NavigationSidebarComponent } from './sidebar-wrapper/navigation-sidebar/navigation-sidebar.component';
import { LiveContentComponent } from './sidebar-wrapper/live-content/live-content.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ArticleInfoSidebarComponent } from './sidebar-wrapper/article-info-sidebar/article-info-sidebar.component';
import { SvgModule } from '@shared/modules/svg/svg.module';
import { ReportBlockComponent } from './report-block/report-block.component';
import { CookiesBannerComponent } from './cookies-banner/cookies-banner.component';
import { ShowcaseEditorComponent } from './showcase-editor/showcase-editor.component';
import { NotificationElementComponent } from './header/notification-element/notification-element.component';
import { CommonDirectivesModule } from '@shared/directives/directives.module';
import { MoreMenuModule } from '@shared/modules/more-menu/more-menu.module';
import { PersonNamePipe } from '@shared/pipes/person-name.pipe';


@NgModule({
  declarations: [
    HeaderComponent,
    LoginFormComponent,
    SearchBoxComponent,
    UserDropdownComponent,
    LoginSocialConnectComponent,
    FeedNavItemComponent,
    LayoutComponent,
    DynamicMetaTagsComponent,
    SidebarWrapperComponent,
    FeedNavComponent,
    ToolbarComponent,
    TrendingSidebarComponent,
    NavigationSidebarComponent,
    LiveContentComponent,
    ArticleInfoSidebarComponent,
    ReportBlockComponent,
    CookiesBannerComponent,
    ShowcaseEditorComponent,
    NotificationElementComponent
  ],
  exports: [
    HeaderComponent,
    LoginSocialConnectComponent,
    LoginFormComponent,
    SearchBoxComponent,
    UserDropdownComponent,
    LayoutComponent,
    SidebarWrapperComponent,
    NotificationElementComponent
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild(),
    SharedComponentsModule,
    SvgModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedPipesModule,
    SharedUiModule,
    NgScrollbarModule,
    CommonDirectivesModule,
    MoreMenuModule
  ],
  providers: [
    PersonNamePipe
  ]
})
export class LayoutModule { }
