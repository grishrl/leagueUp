import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { TeamService } from '../services/team.service';
import { UserService } from '../services/user.service';
import { DivisionService } from '../services/division.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  userName: string
  teamName: string
  divisions
  navBarClass: string = 'collapse navbar-collapse';

  constructor(public Auth:AuthService, private router: Router, public team:TeamService, public user:UserService, private divisionService: DivisionService) { }

  navGo(appRoute?,path?){
    if (!appRoute && !path){
      //hamburger
      this.navBarClass = toggleShow(this.navBarClass);
    }
    else if(path != null && path != undefined && path.length>0){
      this.router.navigateByUrl(appRoute+path);
      this.navBarClass = removeShow(this.navBarClass);
    }else{
      this.router.navigateByUrl(appRoute);
      this.navBarClass = removeShow(this.navBarClass);
      //nah
    }
  }

  logout(){
    this.navBarClass = removeShow(this.navBarClass);
    this.Auth.destroyAuth('/logout');
  }

  ngOnInit() {
    this.divisionService.getDivisionInfo().subscribe( res => {
      this.divisions = res;
    }, err=>{
      console.log(err);
    })
    if(this.Auth.getTeam()){
      this.teamName = this.Auth.getTeam();
    }
    if(this.Auth.isAuthenticated()){
      this.userName=this.Auth.getUser();
    }
  }


}

function removeShow(str){
  let strArr = str.split(' ');
  let index = strArr.indexOf('show');
  if (index > - 1) {
    strArr.splice(index, 1);
  }
  return strArr.join(' ');
}

function toggleShow(str){
  let strArr = str.split(' ');
  let index = strArr.indexOf('show');
  if(index >- 1){
    strArr.splice(index, 1);
  }else{
    strArr.push('show');
  }
  return strArr.join(' ');
}
