import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators'
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class QueuesService {

  constructor( private httpService:HttpService) {

   }

   getQueues(queue){
     let url = 'admin/';
     url += queue;
     return this.httpService.httpGet(url, []);
  }

  getQueuesCount(queue){
    let url = "admin/";
    url += queue;
    return this.httpService.httpGet(url, []);
  }

}
