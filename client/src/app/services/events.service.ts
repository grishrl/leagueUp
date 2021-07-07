import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private httpService:HttpService) { }

  localEvent = {};

  setLocalEvent(obj){
    this.localEvent = obj;
  }

  getLocalEvent(){
    return this.localEvent;
  }

  destroyLocalEvent(){
    this.localEvent = {};
  }

  deleteEvent(id){
    let url = '/events/delete';
    let payload = {
      id:id
    };
    return this.httpService.httpPost(url, payload, true);
  }

  upsertEvent(orig, upsert){
    let url = '/events/upsert';
    let payload = {
      "org_event":orig,
      "event":upsert
    };
    return this.httpService.httpPost(url, payload, true);
  }

  getEventById(id){
    let url = '/events/get/id';
    let payload = {
      "id":id
    };
    return this.httpService.httpPost(url, payload);
  };

  getEventByParams(param){
    let url = '/events/get/params';
    let payload = param;
    return this.httpService.httpPost(url, payload);
  }
  getAll() {
    let url = '/events/get/all';
    let payload = {};
    return this.httpService.httpPost(url, payload);
  }
}
