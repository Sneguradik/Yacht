import { Injectable } from '@angular/core';
import { ApiService } from '@api/services/api.service';
import { Observable } from 'rxjs';
import { ReportEntityTypeEnum } from '@api/schemas/report/report-entity-type.enum';

const CONTROLLER_ENDPOINT = 'report';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private readonly api: ApiService) {}

  public send$(type: ReportEntityTypeEnum, id: number, message?: string): Observable<never> {
    return this.api.post$(CONTROLLER_ENDPOINT, { type, id, message });
  }
}
