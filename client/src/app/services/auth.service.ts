import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Injectable({providedIn: 'root'})

export class AuthService {

  constructor(private router:Router, private http: HttpClient){
   
  }

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
  createAuth(token,username,teamInfo){

    localStorage.setItem('token', token);
    localStorage.setItem('userName', username);
    
    if(teamInfo){

      if (teamInfo.hasOwnProperty('teamName')){
        localStorage.setItem('teamName', teamInfo.teamName);
      }

      if(teamInfo.hasOwnProperty('isCaptain')){
        localStorage.setItem('captain', teamInfo.isCaptain.toSting());
      }else{
        localStorage.setItem('captain', 'false');
      }
    
    }
  }

  //captain methods:
  setCaptain(cap){
    localStorage.setItem('captain', cap);
  }
  getCaptain(){
    localStorage.getItem('captain');
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
    let url = 'http://localhost:3000/auth/logout';

    this.http.get(url).subscribe(
      res => {
        localStorage.removeItem('userName');
        localStorage.removeItem('token');
        localStorage.removeItem('teamName');
        localStorage.removeItem('captain');
        this.router.navigate(['/logout']);
      }
    );

  }
}