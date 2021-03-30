import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError, share, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';
import { forEach } from 'lodash';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class HttpServiceService {

  constructor(private http: HttpClient, private notificationService:NotificationService) { }

  buildUri(url){

        if (url.indexOf("api") == -1) {
          if (url.charAt(0) == "/") {
            url = `api${url}`;
          } else {
            url = `api/${url}`;
          }
        }

    if(environment.serverTLD){
      url = environment.serverTLD+url;
    }
    return url;
  }

  httpPost(url, payload, showNotification?:boolean){
    if(showNotification){
      this.notificationService.subj_notification.next('Working..');
    }
    // if(url.indexOf('api')==-1){
    //   if(url.charAt(0) == '/'){
    //     url = `api${url}`;
    //   }else{
    //     url = `api/${url}`;
    //   }

    // }
    url = this.buildUri(url);
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
    // if(url.indexOf('api')==-1){
    //   if(url.charAt(0) == '/'){
    //     url = `api${url}`;
    //   }else{
    //     url = `api/${url}`;
    //   }
    // }
   url = this.buildUri(url);
   if(parameters){
     if(Array.isArray(parameters)){
           parameters.forEach((element, index) => {
             let key = Object.keys(element);
             if (index == 0) {
               url += "?" + key[0] + "=" + element[key[0]];
             } else {
               url += "&" + key[0] + "=" + element[key[0]];
             }
           });
     }else if(typeof parameters === 'object'){
       let index = 0;
       forEach(parameters, (value, key) => {
         if (index == 0) {
           url += "?" + key + "=" + value;
         } else {
           url += "&" + key + "=" + value;
         }
         index++;
       });
     }

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
      //  if (url.indexOf("api") == -1) {
      //    if (url.charAt(0) == "/") {
      //      url = `api${url}`;
      //    } else {
      //      url = `api/${url}`;
      //    }
      //  }
    url = this.buildUri(url);
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
