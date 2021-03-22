import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { HttpServiceService } from './http-service.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

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



  constructor(private httpService:HttpServiceService) { }
}
