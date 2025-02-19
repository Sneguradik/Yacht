import { Directive, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { SessionService } from '@app/services/session.service';
import { IUserViewFull } from '@api/schemas/user/user-view-full.interface';

@Directive({
  selector: '[appLoggedIn]',
})
export class LoggedInDirective implements OnInit {
  constructor(
    private readonly sessionService: SessionService,
    private readonly templateRef: TemplateRef<any>,
    private readonly viewContainer: ViewContainerRef,
  ) {}

  ngOnInit(): void {
    this.sessionService.user$.subscribe((user: IUserViewFull) => {
      this.viewContainer.clear();
      if (user) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
