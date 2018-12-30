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

  constructor(public Auth:AuthService, private router: Router, private team:TeamService, private user:UserService, private divisionService: DivisionService) { }

  navGo(appRoute,path){
    if(path != null && path != undefined && path.length>0){
      this.router.navigateByUrl(appRoute+path);
    }else{
      //nah
    }
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
