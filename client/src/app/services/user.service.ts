import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, share, shareReplay } from 'rxjs/operators';
import { Profile } from  '../classes/profile.class';
import { Observable, of } from 'rxjs';
import { HttpService } from './http.service';
import { environment } from '../../environments/environment'
import { CacheService } from './cache.service';



//methods for getting and calling user information

@Injectable({ providedIn: "root" })
export class UserService {
  userGetURL = "user/get";



  //gets the user profile to match
  getUser(id): Observable<Profile> {
    console.log('id');
    let encodedID = encodeURIComponent(id);
    let params = [{ user: encodedID }];
    return this.httpService.httpGet(this.userGetURL, params);
  }

  //return user name by id; or from cache if it exists
  cachedGetUserNameFromId(id): Observable<Profile> {
    return this.cache.getCached(id, this.getUserById(id));
  }

  //gets the user profile to match
  getUserById(id): Observable<Profile> {
    let encodedID = encodeURIComponent(id);
    let params = [{ userId: encodedID }];
    return this.httpService.httpGet(this.userGetURL, params);
  }

  getCasters(){
    let url = 'user/get/casters';
    return this.httpService.httpGet(url, []);
  }

  //   getStatistics(username){
  //   let encodedID = encodeURIComponent(username);
  //   let url = '/user/statistics';
  //   let params = [{ id: encodedID }];
  //   return this.httpService.httpGet(url, params);
  // }

  //sends the information to the outreach route
  emailOutreach(email) {
    let url = "/outreach/invite";
    let payload = {
      userEmail: email,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  heartbeat() {
    let url = "/auth/heartbeat";
    return this.httpService.httpGet(url, []);
  }

  //searchs for users
  userSearch(id, type?): Observable<any> {
    let allUrl = "search/user";
    let unTeamedUrl = "/search/user/unteamed";
    let url;

    if (typeof id != "object") {
      id = { userName: id };
    }

    if (type == undefined || type == null) {
      url = allUrl;
    } else if (type == "unteamed") {
      url = unTeamedUrl;
    } else if (type == "all") {
      url = allUrl;
    }

    return this.httpService.httpPost(url, id);
  }

  //saves user profile
  saveUser(user): Observable<any> {
    let url = "user/save";
    return this.httpService.httpPost(url, user, true);
  }

  userMarketSearch(searchObj) {
    let url = "/search/user/market";
    let payload = {
      searchObj: searchObj,
    };
    return this.httpService.httpPost(url, payload);
  }

  //deletes the user
  deleteUser() {
    let url = "user/delete";
    return this.httpService.httpGet(url, [], true);
  }

  //returns total number of users looking for group
  getUsersNumber() {
    let url = "/search/users/total";
    return this.httpService.httpGet(url, []);
  }

  getUsersOfPageNum(page, msg?) {
    let url = "/search/user/paginate";
    let payload = {
      page: page,
    };
    return this.httpService.httpPost(url, payload, msg);
  }

  //this allows us to filter out users who are invited to the team, for a captain... so that the invited users don't show in the list
  getFilteredUsersNumber() {
    let url = "/search/users/filtered/total";
    return this.httpService.httpGet(url, []);
  }
  //gets the filtered users
  getFilteredUsersOfPageNum(page, msg?) {
    let url = "/search/user/filtered/paginate";
    let payload = {
      page: page,
    };
    return this.httpService.httpPost(url, payload, msg);
  }

  //captures and sends created user and the invite token they used when logging in;
  //this clears the pending outreach in queue
  outreachResponse(token, user): Observable<any> {
    let url = "outreach/inviteResponseComplete";

    if (typeof token != "object") {
      token = { referral: token, user: user };
    }
    return this.httpService.httpPost(url, token);
  }

  //replaces URL safe character # with _ for URLs for usernames
  routeFriendlyUsername(username): string {
    if (typeof username == "string") {
      if (username != null && username != undefined) {
        return username.replace("#", "_");
      } else {
        return "";
      }
    } else {
      return "";
    }
  }

  //turns any user name that has been sanatised for URL back to the real user name
  realUserName(username): string {
    if (username != null && username != undefined) {
      return username.replace("_", "#");
    } else {
      return "";
    }
  }

  //retuns a formatted string that includes the requisite info to retrieve an image from s3 bucket
  avatarFQDN(img) {
    let imgFQDN =
      "https://s3.amazonaws.com/" +
      environment.s3bucketGeneralImage +
      "/player-avatar/";
    if (img) {
      img = encodeURIComponent(img);
      imgFQDN += img;
    } else {
      imgFQDN += "defaultAvatar.png";
    }

    return imgFQDN;
  }

  //retuns a formatted string that includes the requisite info to retrieve a rank image from s3 bucket
  rankVerificationFQDN(img) {
    let imgFQDN =
      "https://s3.amazonaws.com/" +
      environment.s3bucketRankVerification+'/';
    if (img) {
      img = encodeURIComponent(img);
      imgFQDN += img;
    } else {
      imgFQDN += "defaultAvatar.png";
    }

    return imgFQDN;
  }

  //uploads team logo
  avatarUpload(imgInput) {
    let url = "user/upload/avatar";
    return this.httpService.httpPost(url, imgInput, true);
  }

  updateUserMmr() {
    let url = "user/update/mmr";
    return this.httpService.httpGet(url, [], true);
  }

  constructor(
    private httpService: HttpService,
    private cache: CacheService
  ) {}
}
