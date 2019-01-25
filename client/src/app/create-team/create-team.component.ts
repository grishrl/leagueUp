import { Component, OnInit } from '@angular/core';
import { Team } from '../classes/team.class';
import { TeamService } from '../services/team.service';
import { TimezoneService } from '../services/timezone.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { UtilitiesService } from '../services/utilities.service';

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
  availabilityValid:boolean
  
  constructor(private team: TeamService, public timezone:TimezoneService, private auth: AuthService, private route:Router, private util:UtilitiesService) { }

  nameContorl = new FormControl();
  timeZoneControl = new FormControl();

  createTeamControlGroup = new FormGroup({
    nameControl: this.nameContorl,
    timeZone: this.timeZoneControl
  })

  

  ngOnInit() {
    this.markFormGroupTouched(this.createTeamControlGroup);
    this.returnedProfile = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  }

  cancel() {
    this.returnedProfile = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  }

  receiveTimesValidity(event){
    this.availabilityValid=event;
  }

  save() {
    let checkName = this.returnedProfile.teamName.toLowerCase()
    this.team.getTeam(checkName).subscribe( res =>{
      if(res && res.teamName){
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
            console.log(err);
          })
        }else{
          alert('required infomation not included');
        }
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {

    if (formGroup.controls) {
      const keys = Object.keys(formGroup.controls);
      for (let i = 0; i < keys.length; i++) {
        const control = formGroup.controls[keys[i]];

        if (control instanceof FormControl) {
          control.markAsTouched();
        } else if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    }
  }

  validate() {
    let valid = true;
    //validate team name is there
    if(!this.util.returnBoolByPath(this.returnedProfile, 'teamName')){
      this.nameContorl.setErrors({required:true});
      valid = false;
    }else{
      let regEx = new RegExp(/[%_]/gm);
      if (regEx.test(this.returnedProfile.teamName)) {
        valid = false;
        this.nameContorl.setErrors({ invalidCharacters: true });
      } else {
        this.nameContorl.setErrors(null);
      }

    }

    //validate looking for team:
    if (!this.util.returnBoolByPath(this.returnedProfile, 'lookingForMore')) {
      valid = false;
    }

    //validate that there is at least 1 available day
    if (!this.availabilityValid){
      valid = false;
    }

    //ensure time zone
    if (!this.util.returnBoolByPath(this.returnedProfile,'timeZone') ) {
      this.timeZoneControl.setErrors({required:true});
      valid = false;
    }else{
      this.timeZoneControl.setErrors(null);
    }

    return valid;
  }

}
