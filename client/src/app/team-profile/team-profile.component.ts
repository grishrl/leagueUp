import { Component, OnInit } from '@angular/core';
import { TimezoneService } from '../timezone.service';
import { TeamService } from '../team.service';
import { ActivatedRoute } from '@angular/router';
import { merge } from 'lodash';
import { Subscription } from 'rxjs';
import { Team } from '../classes/team.class';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-team-profile',
  templateUrl: './team-profile.component.html',
  styleUrls: ['./team-profile.component.css']
})
export class TeamProfileComponent implements OnInit {
  editOn: boolean = true;
  teamName:String;
  displayDivison:string=""
  returnedProfile = new Team(null, null, null, null, null, null, null, null, null);
  teamSub: Subscription;
  filterUsers:any[]=[]

  hlMedals = ['Grand Master', 'Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'];
  hlDivision = [1, 2, 3, 4, 5];
  competitonLevel = [
    'Low', 'Medium', 'High'
  ]
  constructor(private auth: AuthService, public timezone: TimezoneService, private team: TeamService, private route:ActivatedRoute) {
    this.teamName = team.realTeamName(this.route.snapshot.params['id']);
   }

  openEdit(){
    this.editOn=false;
    this.tempProfile = Object.assign({}, this.returnedProfile);
  } 
  tempProfile
  cancel() {
    this.returnedProfile = Object.assign({}, this.tempProfile);
    this.editOn = true;
  }
  save(){
    this.editOn = true;
    console.log('saving data wink wink');
  }


  ngOnInit() {
    this.teamSub = this.team.getTeam(this.teamName).subscribe((res)=>{
      merge(this.returnedProfile, res);
      console.log('team ',this.returnedProfile)
      if(this.returnedProfile.teamDivision){
        this.displayDivison+="";

        let divDisplay = this.returnedProfile.teamDivision.divisionName;
        let char = divDisplay.charAt(0);
        let capChar = char.toUpperCase();
        divDisplay = divDisplay.replace(char, capChar);

        this.displayDivison += divDisplay;
        if (this.returnedProfile.teamDivision.coastalDivision){
          this.displayDivison += " " + this.returnedProfile.teamDivision.coastalDivision.toUpperCase();
        }
      }
      if (this.returnedProfile.teamMembers && this.returnedProfile.teamMembers.length>0){
        this.returnedProfile.teamMembers.forEach(element=>{
          this.filterUsers.push(element.displayName);
        });
      }
    });
  }

}
