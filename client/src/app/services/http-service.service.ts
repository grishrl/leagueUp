import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpServiceService {

  constructor(private http: HttpClient) { }

  httpPost(url, payload){
    return this.http.post(url, payload).pipe(
      map(
        res=> { return res['returnObject']}
      )
    )
  };

  httpGet(url, parameters){
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
    return this.http.get(url).pipe(
      map(
        res=>{ return res['returnObject']}
      )
    )
  }
}
