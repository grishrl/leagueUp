import { Component, OnInit } from '@angular/core';
import { TimezoneService } from '../services/timezone.service';
import { TeamService } from '../services/team.service';
import { ActivatedRoute } from '@angular/router';
import { merge } from 'lodash';
import { Subscription } from 'rxjs';
import { Team } from '../classes/team.class';
import { AuthService } from '../services/auth.service';

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
    { val: 1, display: 'Low' },
    { val: 3, display: 'Medium' },
    { val: 5, display: 'High' }
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

  hideDay(editSwitch, dayAvailabilty): boolean {
    if (!editSwitch) {
      return false;
    } else {
      if (dayAvailabilty) {
        return false;
      } else {
        return true;
      }
    }
  }

  save(){
    if(this.validate()){
      this.editOn = true;
      let cptRemoved = Object.assign({}, this.returnedProfile);
      delete cptRemoved.captain;
      this.team.saveTeam(cptRemoved).subscribe((res) => {
        this.editOn = true;
      }, (err) => {
        console.log(err);
        alert(err.message);
      });
    }else{
      //activate validator errors
      console.log('the data was invalid')
    }

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
