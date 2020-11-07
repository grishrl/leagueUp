import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UtilitiesService } from './utilities.service';
// import { Socket } from 'ngx-socket-io';
import { NotificationService } from './notification.service';
// import { WebsocketService } from './websocket.service';


@Injectable({providedIn: 'root'})

export class AuthService {

  constructor(private router:Router, private http: HttpClient, private util:UtilitiesService, private notificationService:NotificationService){

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

  isCaster():Boolean{
    return this.getCaster() == 'true';
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

    this.setToken(token);
    this.setUser(decodedToken.displayName);
    // localStorage.setItem('userName', decodedToken.displayName);
    if (decodedToken.teamInfo){
      if (this.util.returnBoolByPath(decodedToken, 'teamInfo.teamId')) {
        this.setTeamId(decodedToken.teamInfo.teamId);
      }
      if (this.util.returnBoolByPath(decodedToken, 'teamInfo.teamName')){
        this.setTeam(decodedToken.teamInfo.teamName)
      }
      if (this.util.returnBoolByPath(decodedToken, 'teamInfo.isCaptain')){
        this.setCaptain(decodedToken.teamInfo.isCaptain.toString());
      }else{
        this.setCaptain('false');
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
            this.setCaster('true');
          }
        }
      });
      if(adminString.length>0){
        this.setAdmin(adminString);
      }
    }
    if(decodedToken.id){
      this.setUserId(decodedToken.id);
    }

    if (this.getUserId()) {
      // this.ws.send({ storeClientInfo: { userId: this.getUserId() } });
    }
    this.notificationService.updateLogin.next('next');
  }

  //USER ID
  setUserId(id){
    localStorage.setItem('userId', id.toString());
  }
  getUserId(){
    return localStorage.getItem('userId');
  }
  destroyId(){
    localStorage.removeItem('userId');
  }

  //team id
  setTeamId(id) {
    localStorage.setItem('teamId', id.toString());
  }
  getTeamId() {
    return localStorage.getItem('teamId');
  }
  destroyTeamId() {
    localStorage.removeItem('teamId');
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
  destroyAuth(route){
    let url = '/api/auth/logout';
    // this.ws.disconnectSocket();

    this.http.get(url).subscribe(
      res => {
        this.destroyUser();
        this.destroyToken()
        this.destroyTeam();
        this.destroyCaptain();
        this.destroyAdmin();
        this.destroyCaster();
        this.destroyId();
        this.destroyTeamId();
        this.router.navigate([route]);
      }
    );

  }

}
