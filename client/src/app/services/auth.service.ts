import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable({providedIn: 'root'})

export class AuthService {

  constructor(private router:Router, private http: HttpClient){
   
  }

  helper = new JwtHelperService();

  isAuthenticated():Boolean{
    var test = localStorage.getItem('token');
    if(test!=null&&test!=undefined&&test!=''){
      return true;
    }else{
      return false;
    }
  }

  setReferral(token){
    
     localStorage.setItem('referral', token);
  }
  getReferral(){

     return localStorage.getItem('referral');
  }
  destroyReferral(){
    localStorage.removeItem('referral');
  }

  //auth initializater
  createAuth(token){
    let decodedToken = this.helper.decodeToken(token);
    console.log(decodedToken);
    localStorage.setItem('token', token);
    localStorage.setItem('userName', decodedToken.displayName);
    if (decodedToken.teamInfo){
      if (this.returnBoolByPath(decodedToken, 'teamInfo.teamName')){
        localStorage.setItem('teamName', decodedToken.teamInfo.teamName);
      }
      if (this.returnBoolByPath(decodedToken, 'teamInfo.isCaptain')){
        localStorage.setItem('captain', decodedToken.teamInfo.isCaptain.toString());
      }else{
        localStorage.setItem('captain', 'false');
      }
    }
    //TODO: do something with the new admin bits passed to local
    if(decodedToken.adminLevel){
      let adminString = '';
      decodedToken.adminLevel.forEach(element => {
        let keys = Object.keys(element);
        if(keys.length>0){
          if(keys[0]!='CASTER'){
            adminString += keys[0].toLowerCase()
          }else{
            localStorage.setItem('caster', 'true');
          }
        }
        
      });
      if(adminString.length>0){
        localStorage.setItem('admin', adminString);
      }
    }
  }

  //caster methods
  setCaster(caster){
    localStorage.setItem('caster', caster);
  }
  getCaster(){
    return localStorage.getItem('caster');
  }
  destroyCaster(){
    localStorage.removeItem('caster');
  }
  //captain methods:
  setCaptain(cap){
    localStorage.setItem('captain', cap);
  }
  getCaptain():string {
    return localStorage.getItem('captain');
  }
  destroyCaptain(){
    localStorage.removeItem('captain');
  }

  //token methods:
  setToken(token){
    localStorage.setItem('token', token);
  }
  getToken():string{
    return localStorage.getItem('token');
  }
  destroyToken(){
    localStorage.removeItem('token');
  }

  //user methods:
  setUser(user){
    localStorage.setItem('userName',user);
  }
  getUser():string{
    return localStorage.getItem('userName');
  }
  destroyUser() {
    localStorage.removeItem('userName');
  }

  //admin methods
  setAdmin(admin){
    localStorage.setItem('admin', admin.toLowerCase());
  }
  getAdmin():string{
    return localStorage.getItem('admin');
  }
  destroyAdmin(){
    localStorage.removeItem('admin');
  }

  checkAdminLevel(level){
    let admin = localStorage.getItem('admin');
    return !!admin.indexOf(level.toLowerCase());
  }

  //team methods:
  setTeam(teamName){
    localStorage.setItem('teamName', teamName);
  }
  getTeam():string{
    return localStorage.getItem('teamName');
  }
  destroyTeam(){
    localStorage.removeItem('teamName');
  }

  //destroy all auth
  destroyAuth(){
    // let url = 'http://localhost:3000/auth/logout';
    let url = '/auth/logout';


    this.http.get(url).subscribe(
      res => {
        localStorage.removeItem('userName');
        localStorage.removeItem('token');
        localStorage.removeItem('teamName');
        localStorage.removeItem('captain');
        this.destroyAdmin();
        this.destroyCaster();
        this.router.navigate(['/logout']);
      }
    );

  }

  returnBoolByPath(obj, path): boolean {
    //path is a string representing a dot notation object path;
    //create an array of the string for easier manipulation
    let pathArr = path.split('.');
    //return value
    let retVal = null;
    //get the first element of the array for testing
    let ele = pathArr[0];
    //make sure the property exist on the object
    if (obj.hasOwnProperty(ele)) {
      if (typeof obj[ele] == 'boolean') {
        retVal = true;
      }
      //property exists:
      //property is an object, and the path is deeper, jump in!
      else if (typeof obj[ele] == 'object' && pathArr.length > 1) {
        //remove first element of array
        pathArr.splice(0, 1);
        //reconstruct the array back into a string, adding "." if there is more than 1 element
        if (pathArr.length > 1) {
          path = pathArr.join('.');
        } else {
          path = pathArr[0];
        }
        //recurse this function using the current place in the object, plus the rest of the path
        retVal = this.returnBoolByPath(obj[ele], path);
      } else if (typeof obj[ele] == 'object' && pathArr.length == 0) {
        retVal = obj[ele];
      } else {
        retVal = obj[ele]
      }
    }
    return !!retVal;
  }
}
