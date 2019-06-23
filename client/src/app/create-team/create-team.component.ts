import { Component, OnInit } from '@angular/core';
import { Team } from '../classes/team.class';
import { TeamService } from '../services/team.service';
import { TimezoneService } from '../services/timezone.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { UtilitiesService } from '../services/utilities.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-create-team',
  templateUrl: './create-team.component.html',
  styleUrls: ['./create-team.component.css']
})
export class CreateTeamComponent implements OnInit {
  returnedProfile: Team

  availabilityValid:boolean
  availabilityDays:number=0;

  constructor(private team: TeamService, public timezone:TimezoneService, private auth: AuthService, private route:Router, private util:UtilitiesService, private user:UserService) { }

  nameContorl = new FormControl();

  tickerControl = new FormControl('',[Validators.maxLength(5), Validators.minLength(2)]);

  timeZoneControl = new FormControl();

  createTeamControlGroup = new FormGroup({
    nameControl: this.nameContorl,
    tickerControl:this.tickerControl,
    timeZone: this.timeZoneControl
  })

  timezoneError
  captainDiscordTag

  ngOnInit() {
    this.markFormGroupTouched(this.createTeamControlGroup);
    this.user.getUser(this.auth.getUser()).subscribe(
      res=>{
        if(res.discordTag){
          this.captainDiscordTag = true;
        }else{
          this.captainDiscordTag = false;
        }
      },
      err=>{
        this.captainDiscordTag = false;
        console.warn("Error getting user data ", err);
      }
    )
    this.returnedProfile = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  }

  cancel() {
    this.returnedProfile = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  }

  receiveTimesValidity(event){
    this.availabilityValid=event.valid;
    this.availabilityDays = event.numdays;
  }

  save() {
    let checkName = this.returnedProfile.teamName.toLowerCase()
    this.team.getTeam(checkName).subscribe( res =>{
      if(res && res.teamName){
        alert('Team name is taken!');
        this.nameContorl.setErrors({taken:true});
      }else{
        if (this.validate()) {
          this.util.updateAvailabilityToNum(this.returnedProfile);
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
  showError
  validate() {

    let valid = true;
    //validate this user has a discord tag in their profile

    if(!this.captainDiscordTag){
    valid = false;
      this.showError = "Discord tag is required for captains please go add it to your profile!"
    }

    //validate team name is there
    if(!this.util.returnBoolByPath(this.returnedProfile, 'teamName')){
      this.nameContorl.setErrors({required:true});
      valid = false;
    }else{
      let regEx = new RegExp(/[%_\/\\`#]/gm);
      if (regEx.test(this.returnedProfile.teamName)) {
        valid = false;
        this.nameContorl.setErrors({ invalidCharacters: true });
      } else {
        this.nameContorl.setErrors(null);
      }
    }

    if(this.tickerControl.errors){
      valid = false;
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
    if (this.availabilityDays > 0 && !this.util.returnBoolByPath(this.returnedProfile,'timeZone') ) {
      this.timeZoneControl.setErrors({required:true});
      valid = false;
      this.timezoneError = {
        error: true
      }
    }else{
      this.timeZoneControl.setErrors(null);
      this.timezoneError = { error: false };
    }

    return valid;
  }

}
