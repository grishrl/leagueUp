import { Injectable } from '@angular/core';
import { DateRange } from '@angular/material/datepicker';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: "root",
})
export class CacheService {
  constructor() {}

  cache: Map<string, any> = new Map();

  //return user name by id; or from cache if it exists
  getCached(cacheId:string, observable:Observable<any>, timeOutMins?:number ): Observable<any> {
    let pendingKey = `${cacheId}-pending`;
    if (this.cache.has(cacheId)) {
      let cached = this.cache.get(cacheId);
      if(cached.hasOwnProperty('timeout')  ){

        let timeout = cached.timeout;
        let born = cached.timestamp;
        let age = timeout+born;

        if(Date.now()>age){
          return this.doCacheWork(observable, timeOutMins, cacheId, pendingKey);
        }else{
          return of(cached.data);
        }
      }else{
        return of(this.cache.get(cacheId));
      }
    } else {
      if (this.cache.has(pendingKey)) {
        return this.cache.get(pendingKey);
      } else {
        return this.doCacheWork(observable, timeOutMins, cacheId, pendingKey);
      }
    }
  }

  private doCacheWork(observable, timeOutMins, cacheId, pendingKey){
            let returnObservable = observable.pipe(
          map((res) => {
            if(timeOutMins){
              let cacheObj = {
                timestamp:Date.now(),
                timeout: timeOutMins*60*1000
              }
              cacheObj['data']=res;
              this.cache.set(cacheId, cacheObj);
            }else{
              this.cache.set(cacheId, res);
            }
            return res;
          }),
          shareReplay(1)
        );
        this.cache.set(pendingKey, returnObservable);
        return returnObservable;
  }
}
