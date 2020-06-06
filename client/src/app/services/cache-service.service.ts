import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: "root",
})
export class CacheServiceService {
  constructor() {}

  cache: Map<string, any> = new Map();

  //return user name by id; or from cache if it exists
  getCached(cacheId, observable:Observable<any> ): Observable<any> {
    if (this.cache.has(cacheId)) {

      return of(this.cache.get(cacheId));
    } else {
      let pendingKey = `${cacheId}-pending`;
      if (this.cache.has(pendingKey)) {

        return this.cache.get(pendingKey);
      } else {

        let returnObservable = observable.pipe(
          map((res) => {
            this.cache.set(cacheId, res);
            return res;
          }),
          shareReplay(1)
        );
        this.cache.set(pendingKey, returnObservable);
        return returnObservable;
      }
    }
  }
}
