import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { TeamService } from '../team.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  userName: String
  teamName: string
  constructor(private user:UserService, public Auth:AuthService, private team: TeamService, private router: Router) { }

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
