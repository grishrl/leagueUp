import { Component, OnInit } from '@angular/core';
import { Team } from '../classes/team.class';
import { TeamService } from '../services/team.service';
import { TimezoneService } from '../services/timezone.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';

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
  nameContorl = new FormControl();
  timeZoneControl = new FormControl();

  errorAvail:boolean=false;
  //check that the availability exists and that at least one day has been set to true and has time
  checkAvailabilityDays(): boolean {
    let ret = true;
    let nodays= 0;
    if (this.returnBoolByPath(this.returnedProfile,'availability')) {
      //validate that we have start and end times for available days
      for (let day in this.returnedProfile.availability) {
        let checkDay = this.returnedProfile.availability[day];
        if (checkDay.available) {
          if (checkDay.startTime == null && checkDay.endTime == null) {
             ret = false;
          } else if (checkDay.startTime.length == 0 && checkDay.endTime.length == 0) {
            ret = false;
          }
        }else{
          nodays+=1;
        }
      }
    } else {
      ret = false;
    }
    if(nodays==7){
      ret = false;
    }
    return ret;
  }

  ngOnInit() {
    this.returnedProfile = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  }

  cancel() {
    this.returnedProfile = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  }

  save() {
    let checkName = this.returnedProfile.teamName.toLowerCase()
    this.team.getTeam(checkName).subscribe( res =>{
      if(res && res.teamName){
        console.log(res);
        alert('Team name is taken!');
        this.nameContorl.setErrors({taken:true});
      }else{
        if (this.validate()) {
          this.returnedProfile.teamName_lower = checkName;
          this.team.createTeam(this.returnedProfile).subscribe( res =>{
            this.auth.setCaptain('true');
            this.auth.setTeam(res.teamName_lower);
            // go to the team profile page.
            this.route.navigate(['/teamProfile', this.team.routeFriendlyTeamName(res.teamName)]);
          }, err=>{
            console.log(res);
            alert(err);
          })
        }else{
          alert('required infomation not included');
        }
      }
    });
  }


  validate() {
    let valid = true;
    //validate team name is there
    if(!this.returnBoolByPath(this.returnedProfile, 'teamName')){
      this.nameContorl.setErrors({required:true});
      valid = false;
    }else{
      this.nameContorl.setErrors(null);
    }
    //validate looking for team:
    if (!this.returnBoolByPath(this.returnedProfile, 'lookingForMore')) {
      valid = false;
    }

    //validate that there is at least 1 available day
    if (this.checkAvailabilityDays()){
      valid = true;
      this.errorAvail = false;
    }else{
      valid = false;
      this.errorAvail = true;
    }


    //ensure time zone
    if (!this.returnBoolByPath(this.returnedProfile,'timeZone') ) {
      this.timeZoneControl.setErrors({required:true});
      valid = false;
    }else{
      this.timeZoneControl.setErrors(null);
    }

    return valid;
  }

  returnBoolByPath(obj, path): boolean  {
    //path is a string representing a dot notation object path;
    //create an array of the string for easier manipulation
    let pathArr = path.split('.');
    //return value
    let retVal = null;
    //get the first element of the array for testing
    let ele = pathArr[0];
    //make sure the property exist on the object
    if (obj.hasOwnProperty(ele)) {
      if (typeof obj[ele] == 'boolean') {
        retVal = true;
      }
      //property exists:
      //property is an object, and the path is deeper, jump in!
      else if (typeof obj[ele] == 'object' && pathArr.length > 1) {
        //remove first element of array
        pathArr.splice(0, 1);
        //reconstruct the array back into a string, adding "." if there is more than 1 element
        if (pathArr.length > 1) {
          path = pathArr.join('.');
        } else {
          path = pathArr[0];
        }
        //recurse this function using the current place in the object, plus the rest of the path
        retVal = this.returnBoolByPath(obj[ele], path);
      } else if (typeof obj[ele] == 'object' && pathArr.length == 0) {
        retVal = obj[ele];
      } else {
        retVal = obj[ele]
      }
    }
    return !!retVal;
  }

}
