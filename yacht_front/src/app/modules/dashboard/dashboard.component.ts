import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformService } from '@shared/services/platform.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  constructor(public readonly router: Router, public readonly platformService: PlatformService) {}
}
