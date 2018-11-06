import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { TeamService } from '../services/team.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  userName: String
  teamName: string
  constructor(public Auth:AuthService, private router: Router, private team:TeamService, private user:UserService) { }

  navGo(appRoute,path){
    console.log(path);
    if(path != null && path != undefined && path.length>0){
      this.router.navigateByUrl(appRoute+path);
    }else{
      //nah
    }
  }
  ngOnInit() {
    if(this.Auth.getTeam()){
      this.teamName = this.Auth.getTeam();
    }
    if(this.Auth.isAuthenticated()){
      this.userName=this.Auth.getUser();
    }
  }

}
