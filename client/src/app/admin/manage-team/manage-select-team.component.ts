import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../services/team.service';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-select-team',
  templateUrl: './manage-select-team.component.html',
  styleUrls: ['./manage-select-team.component.css']
})
export class ManageSelectTeamComponent implements OnInit {

  constructor(private admin: AdminService, private team: TeamService, private router:Router) { }

  //component properties
  recievedProfile
  turnOnForm: boolean = false;
  pulledProfile:any
  teams:any[]=[];

  //callback function that is passed to the search component, accepts the profile selected from that component
  //santaizes the returned profile for URL and routes to that profile 
  receiveTeam(teamProf) {
    if (teamProf != null && teamProf != undefined) {
      this.goView(this.team.routeFriendlyTeamName(teamProf.teamName_lower));
    }
  }

  //function tied to the list of teams, accepts team in scope, 
  //sanatizes the team name and routes to the proper endpoint
  selectedFromList(prof){
    this.goView(this.team.routeFriendlyTeamName(prof.teamName_lower));
  }

  //takes id and routes to the manageTeam of id
  goView(id){
    this.router.navigate(['_admin/manageTeam/', id]);
  }

  ngOnInit() {
    //returns the teams for displaying in list. 
    //TODO: check into pagination 
    this.admin.getTeams().subscribe(
      (res)=>{
        this.teams = res;
      },
      (err)=>{
        console.log(err);
      }
    )
  }

}
