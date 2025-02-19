import { Injectable } from '@angular/core';
import Fingerprint2 from 'fingerprintjs2';
import { Observable, from, of } from 'rxjs';
import { publishReplay, map, refCount } from 'rxjs/operators';
import { PlatformService } from '@shared/services/platform.service';

@Injectable({
  providedIn: 'root'
})
export class FingerprintService {
  private fingerprintObservable$: Observable<string>;

  constructor(private readonly platformService: PlatformService) {}

  public get fingerprint$(): Observable<string> {
    if (!this.fingerprintObservable$) {
      if (this.platformService.isBrowser) {
        this.fingerprintObservable$ = from(Fingerprint2.getPromise()).pipe(
          map((components: Fingerprint2.Component[]) => Fingerprint2.x64hash128(components.join(''), 31)),
          publishReplay(1),
          refCount(),
        );
      } else {
        this.fingerprintObservable$ = of('');
      }
    }

    return this.fingerprintObservable$;
  }
}
