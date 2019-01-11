import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Profile } from  '../classes/profile.class';
import { Observable } from 'rxjs';
import { HttpServiceService } from './http-service.service';



//methods for getting and calling user information

@Injectable({ providedIn: 'root' })

export class UserService {

  //gets the user profile to match
  getUser(id): Observable<Profile>{
    let encodedID = encodeURIComponent(id);
    let url = 'user/get';
    let params = [{user: encodedID}];
    return this.httpService.httpGet(url, params);    
  }

  //sends the information to the outreach route
  emailOutreach(email){
    let url = '/outreach/invite';
    let payload = {
      userEmail:email
    }
    return this.httpService.httpPost(url, payload, true);

  }

  //searchs for users
  userSearch(id, type?):Observable<any>{

    let allUrl = 'search/user';
    let unTeamedUrl = '/search/user/unteamed';
    let url;
    
    if(typeof id != 'object'){
        id = {'userName':id}
    }

   if(type==undefined||type==null){
    url = allUrl;
   }else if( type == 'unteamed'){
     url = unTeamedUrl;
   }else if( type == 'all'){
     url = allUrl;
   }

   return this.httpService.httpPost(url, id);   

  }

  //saves user profile
  saveUser(user):Observable<any>{
    let url = "user/save";
    return this.httpService.httpPost(url, user, true);
  }

  //deletes the user
  deleteUser(){
    let url = "user/delete";
    return this.httpService.httpGet(url,[], true);
  }

  //captures and sends created user and the invite token they used when logging in;
  //this clears the pending outreach in queue
  outreachResponse(token, user):Observable<any>{
    let url = 'outreach/inviteResponseComplete';

    if(typeof token != 'object'){
      token = { "referral":token , "user":user };
    }
    return this.httpService.httpPost(url, token);
  }

  //replaces URL safe character # with _ for URLs for usernames
  routeFriendlyUsername(username): string {
    if(username!=null&&username!=undefined){
      return username.replace('#', '_');
    }else{
      return '';
    }
  }

  //turns any user name that has been sanatised for URL back to the real user name
  realUserName(username): string {
    if (username != null && username != undefined) {
      return username.replace('_', '#');
    }else{
      return '';
    }
  }

  constructor(private httpService: HttpServiceService) { }
}
