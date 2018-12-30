import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Profile } from  '../classes/profile.class';
import { Observable } from 'rxjs';



//methods for getting and calling user information

@Injectable({ providedIn: 'root' })

export class UserService {

  getUser(id): Observable<Profile>{
    let encodedID = encodeURIComponent(id);
    let url = 'user/get?user=' + encodedID;

    return this.http.get<Profile>(url).pipe(
      map((res) => {
        return res;
      })
    );
    
  }

  userSearch(id):Observable<any>{
    let url = 'search/user';
    
  if(typeof id != 'object'){
      id = {'userName':id}
   }
   return this.http.post<any>(url, id).pipe(map(res=>{
     return res.returnObject;
   }))
  }

  saveUser(user):Observable<any>{
    let url = "user/save";

    return this.http.post(url, user).pipe(
      tap((ret)=>{
        if(ret){
          return ret.updated;
        }else{  
          return false;
        }
      }));
  }

  deleteUser(){
    let url = "user/delete";

    return this.http.get(url).pipe(
      map( ret => {return ret;} )
    )
  }

  outreachResponse(token):Observable<any>{
    let url = 'outreach/inviteResponseComplete';

    if(typeof token != 'object'){
      token = { "referral":token };
    }
    return this.http.post(url, token)
  }

  routeFriendlyUsername(username): string {
    if(username!=null&&username!=undefined){
      return username.replace('#', '_');
    }else{
      return '';
    }
    
  }

  realUserName(username): string {
    if (username != null && username != undefined) {
      return username.replace('_', '#');
    }else{
      return '';
    }
    
  }

  constructor(private http: HttpClient) { }
}
