import { Component } from '@angular/core';
import { SessionService } from '@app/services/session.service';
import { environment } from '@env';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public blocker = environment.blocker;

  constructor(
    public readonly sessionService: SessionService
  ) { }
}
