import { Injectable } from '@angular/core';
import { HttpService } from "./http.service";

@Injectable({
  providedIn: 'root'
})
export class MvpService {

  constructor(private http:HttpService) { }

  getAll(){
      let url = "/mvp/get";
      return this.http.httpGet(url, []);
  }

  getBySeason(season){
            let url = "/mvp/get";
            return this.http.httpGet(url, [{season}]);
  }

  getMvpById(type, id){
    let url = '/mvp/get';
    const payload = {
      type,
      id
    };
    return this.http.httpGet(url, payload);
  }

  getMvpByList(type, list){
        let url = "/mvp/get";
        const payload = {
          type,
          list
        };
        return this.http.httpGet(url, payload);
  }

  upsertMvp( mvp ){
    let url = '/mvp/upsert';
    return this.http.httpPost(url, mvp, true);
  }

  upvotePotg(id){
    let url = '/mvp/like';
    const payload = {
      id
    }
    return this.http.httpPost(url,payload,true );
  }

}
