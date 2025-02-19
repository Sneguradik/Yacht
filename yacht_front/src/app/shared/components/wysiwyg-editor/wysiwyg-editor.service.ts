import { Injectable } from '@angular/core';
import { UploadService } from '@api/routes/upload.service';
import { Subject, from, merge, Observable } from 'rxjs';
import { switchMap, map, catchError, first } from 'rxjs/operators';
import { IUploadImageResponse } from '@api/schemas/image/upload-image-response.interface';


@Injectable({
  providedIn: 'root'
})
export class WysiwygEditorService {
  constructor(private readonly uploadService: UploadService) { }

  public createCkUploadAdapter(loader: any): {} {
    const cancelled$: Subject<any> = new Subject<any>();
    return {
      upload: () => {
        const file$: Observable<File> = from(loader.file as Promise<File>);
        return merge(cancelled$, file$)
          .pipe(
            switchMap((file: File) => {
              return this.uploadService.uploadImage$(file);
            }),
            map((response: IUploadImageResponse) => ({ default: response.url })),
            catchError((err: Error) => {
              throw err.message || 'Error';
            }),
            first(),
          )
          .toPromise();
      },
      abort: () => cancelled$.error(new Error('Cancelled')),
    };
  }
}
