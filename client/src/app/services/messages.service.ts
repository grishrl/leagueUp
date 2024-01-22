import { Injectable } from '@angular/core';
import { Observable, of, interval } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpService } from './http.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  private REFRESH = 5;

  getMessageNumbers(toGet){
    if(toGet){
          let url = "/messageCenter/get/message/numbers";
          let payload = {
            recipient: toGet,
          };
          return this.httpService.httpPost(url, payload);
    }else{
     return of(null);
    }

  }

    getMessageNumbersInterval(toGet){

    if(toGet){
          this.getMessageNumbers(toGet).subscribe(
            res=>{
              this.NotificationService.updateMessages.next(res);
            }
          )
          interval((this.REFRESH*60*1000)).pipe(
            mergeMap( ()=>this.getMessageNumbers(toGet) )
            ).subscribe(
              data=>{
                this.NotificationService.updateMessages.next(data);
              }
            );
    }else{
     return of(null);
    }

  }

  getMessages(toGet){
    let url = '/messageCenter/get/message';
    let payload = {
      recipient: toGet
    };
    return this.httpService.httpPost(url, payload);
  }

  markRead(msg) {
    let url = '/messageCenter/mark/message/seen';
    let payload = {
      message: msg
    };
    return this.httpService.httpPost(url, payload);
  }

  deleteMessage(msg) {
    let url = '/messageCenter/delete/message';
    let payload = {
      message: msg
    };
    return this.httpService.httpPost(url, payload, true);
  }



  constructor(private httpService:HttpService, private NotificationService:NotificationService) { }
}
