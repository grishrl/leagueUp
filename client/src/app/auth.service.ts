import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';


@Injectable({providedIn: 'root'})

export class AuthService {

  xdom: any
  constructor(private router:Router){
   
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

  createAuth(token,username,teamName){
    localStorage.setItem('token', token);
    localStorage.setItem('userName', username);
    if(teamName){
      localStorage.setItem('teamName', teamName);
    }
  }
  setToken(token){
    localStorage.setItem('token', token);
  }
  getToken():string{
    return localStorage.getItem('token');
  }
  destroyToken(){
    localStorage.removeItem('token');
  }
  setUser(user){
    localStorage.setItem('userName',user);
  }
  getUser():string{
    return localStorage.getItem('userName');
  }
  setTeam(teamName){
    localStorage.setItem('teamName', teamName);
  }
  getTeam():string{
    return localStorage.getItem('teamName');
  }
  destroyUser(){
    localStorage.removeItem('userName');
  }
  destroyAuth(){
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    localStorage.removeItem('teamName');
    this.router.navigateByUrl('/');
  }
}