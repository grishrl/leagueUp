import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
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
        res=> { 
          if(showNotification){
            this.notificationService.subj_notification.next(res['message']);
          }
          return res['returnObject'];
        }
      )
    )
  };

  httpGet(url, parameters, showNotification?:boolean){
    /*
    [{parameter:query}]
    */
   parameters.forEach((element, index) => {
      let key = Object.keys(element);
      if(index==0){
        url+='?'+key[0]+ '=' + element[key[0]];
      }else{
        url += '&' + key[0] + '=' + element[key[0]];
      }
      
   });
    if (showNotification) {
      this.notificationService.subj_notification.next('Working..');
    }
    return this.http.get(url).pipe(
      map(
        res=>{ 
          if (showNotification) {
            this.notificationService.subj_notification.next('Working..');
          }
          return res['returnObject']
        }
      )
    )
  }
}
