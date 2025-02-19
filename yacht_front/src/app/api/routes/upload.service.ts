import { Injectable } from '@angular/core';
import { ApiService } from '@api/services/api.service';
import { Observable } from 'rxjs';
import { IUploadImageResponse } from '@api/schemas/image/upload-image-response.interface';
import { fileToFormData } from '@api/functions/file-to-formdata.function';

const CONTROLLER_ENDPOINT = 'upload';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private readonly apiService: ApiService) { }

  public uploadImage$(image: File): Observable<IUploadImageResponse> {
    return this.apiService.post$<IUploadImageResponse>(`${ CONTROLLER_ENDPOINT }/image`, fileToFormData(image));
  }
}
