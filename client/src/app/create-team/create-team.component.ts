import { Component, OnInit } from '@angular/core';
import { Team } from '../classes/team.class';
import { TeamService } from '../services/team.service';
import { TimezoneService } from '../services/timezone.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-team',
  templateUrl: './create-team.component.html',
  styleUrls: ['./create-team.component.css']
})
export class CreateTeamComponent implements OnInit {
  returnedProfile: Team 

  hlMedals = ['Grand Master', 'Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'];
  hlDivision = [1, 2, 3, 4, 5];
  competitonLevel = [
    { val: 1, display: 'Low'},
    { val: 3, display: 'Medium'},
    { val: 5, display: 'High'}
  ]
  
  constructor(private team: TeamService, public timezone:TimezoneService, private auth: AuthService, private route:Router) { }

  ngOnInit() {
    this.returnedProfile = new Team(null, null, null, null, null, null, null, null, null);
    
  }

  cancel() {
    this.returnedProfile = new Team(null, null, null, null, null, null, null, null, null);
  }

  save() {
    this.team.getTeam(this.returnedProfile.teamName).subscribe( res =>{
      if(res && res.teamName){
        console.log(res);
        alert('Team name is taken!');
      }else{
        if (this.validate()) {
          this.team.createTeam(this.returnedProfile).subscribe( res =>{
            this.auth.setCaptain('true');
            this.auth.setTeam(res.teamName);
            // go to the team profile page.
            this.route.navigate(['/teamProfile', this.team.routeFriendlyTeamName(res.teamName)]);
          }, err=>{
            console.log(res);
            alert(err);
          })
        }else{
          alert('required infomation not included')
        }
      }
    });
  }

  validate() {
    let valid = true;

    //validate looking for team:
    if (this.isNullOrEmpty(this.returnedProfile.lookingForMore)) {
      valid = false;
    }

    //will we require the comp level, play history, roles?

    //validate that we have start and end times for available days
    for (let day in this.returnedProfile.lfmDetails.availability) {
      let checkDay = this.returnedProfile.lfmDetails.availability[day];
      if (checkDay.available) {
        console.log('the times S, E', checkDay.startTime, checkDay.endTime)
        if (checkDay.startTime == null && checkDay.endTime == null) {
          return false;
        } else if (checkDay.startTime.length == 0 && checkDay.endTime.length == 0) {
          return false;
        }
      }
    }

    //ensure time zone
    if (this.isNullOrEmpty(this.returnedProfile.lfmDetails.timeZone)) {
      valid = false;
    }

    return valid;
  }

  isNullOrEmpty(dat): boolean {
    if (dat == null || dat == undefined) {
      return true;
    }
    if (Array.isArray(dat)) {
      if (dat.length == 0) {
        return true;
      }
    } else if (typeof dat == 'object') {
      let noe = false;
      for (let key in dat) {
        if (this.isNullOrEmpty(dat[key])) {
          noe = true;
        }
      }
      return noe;
    } else if (typeof dat == "string") {
      return dat.length == 0;
    } else {
      return false;
    }
  }

}
