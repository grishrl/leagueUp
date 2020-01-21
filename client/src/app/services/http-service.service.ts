import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError, share, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class HttpServiceService {

  constructor(private http: HttpClient, private notificationService:NotificationService) { }

  httpPost(url, payload, showNotification?:boolean){
    if(showNotification){
      this.notificationService.subj_notification.next('Working..');
    }
    return this.http.post(url, payload).pipe(
            map(
              res => {
                if (showNotification) {
                  this.notificationService.subj_notification.next(res['message']);
                }
                return res['returnObject'];
              }
            ),
      catchError(err => {
        if(err.error && showNotification){
          this.notificationService.subj_notification.next(err.error['message']);
        }
        const returnObjs = Observable.create(function (observer) {
          observer.error(err);
        });
        return returnObjs;
      })

    )
  }

  httpGet(url, parameters, showNotification?:boolean){
    /*
    [{parameter:query}]
    */
   if(parameters){
     parameters.forEach((element, index) => {
       let key = Object.keys(element);
       if (index == 0) {
         url += '?' + key[0] + '=' + element[key[0]];
       } else {
         url += '&' + key[0] + '=' + element[key[0]];
       }

     });
   }

    if (showNotification) {
      this.notificationService.subj_notification.next('Working..');
    }
    return this.http.get(url).pipe(
      map(
        res=>{
          if (showNotification) {
            this.notificationService.subj_notification.next(res['message']);
          }
          return res['returnObject']
        },
        catchError(err => {
          if (err.error && showNotification) {
            this.notificationService.subj_notification.next(err.error['message']);
          }
          const returnObjs = Observable.create(function (observer) {
            observer.error(err);
          });
          return returnObjs;
        })
      )
    )
  }

  httpGetShareable(url, parameters, showNotification?: boolean) {
    /*
    [{parameter:query}]
    */
    parameters.forEach((element, index) => {
      let key = Object.keys(element);
      if (index == 0) {
        url += '?' + key[0] + '=' + element[key[0]];
      } else {
        url += '&' + key[0] + '=' + element[key[0]];
      }

    });
    if (showNotification) {
      this.notificationService.subj_notification.next('Working..');
    }
    return this.http.get(url).pipe(
      map(
        res => {
          if (showNotification) {
            this.notificationService.subj_notification.next(res['message']);
          }
          return res['returnObject']
        },
        catchError(err => {
          if (err.error && showNotification) {
            this.notificationService.subj_notification.next(err.error['message']);
          }
          const returnObjs = Observable.create(function (observer) {
            observer.error(err);
          });
          return returnObjs;
        })
      ),
      shareReplay(1)
    )
  }
}
