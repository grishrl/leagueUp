import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class QueuesService {

  constructor( private http: HttpClient) {

   }

   getQueues(queue){
    //  let url = 'http://localhost:3000/admin/';
     let url = 'admin/';
     url += queue;
     return this.http.get(url).pipe(
       map(res => {
         return res['returnObject'];
       })
   )}
   
}
