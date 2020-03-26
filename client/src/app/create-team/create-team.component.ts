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
  selector: "app-create-team",
  templateUrl: "./create-team.component.html",
  styleUrls: ["./create-team.component.css"]
})
export class CreateTeamComponent implements OnInit {
  returnedProfile: Team;

  availabilityValid: boolean;
  availabilityDays: number = 0;

  constructor(
    private team: TeamService,
    public timezone: TimezoneService,
    private auth: AuthService,
    private route: Router,
    private util: UtilitiesService,
    private user: UserService
  ) {}

  nameControl = new FormControl();

  tickerControl = new FormControl("", [
    Validators.maxLength(5),
    Validators.minLength(2)
  ]);

  timeZoneControl = new FormControl();

  createTeamControlGroup = new FormGroup({
    nameControl: this.nameControl,
    tickerControl: this.tickerControl,
    timeZone: this.timeZoneControl
  });

  timezoneError;
  captainDiscordTag;

  initialized = false;
  ngOnInit() {
    this.markFormGroupTouched(this.createTeamControlGroup);
    this.user.getUser(this.auth.getUser()).subscribe(
      res => {
        if (res.discordTag) {
          this.captainDiscordTag = true;
        } else {
          this.captainDiscordTag = false;
        }
        this.initialized = true;
      },
      err => {
        this.captainDiscordTag = false;
        console.warn("Error getting user data ", err);
      }
    );
    this.returnedProfile = new Team(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );
  }

  cancel() {
    this.returnedProfile = new Team(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );
  }

  receiveTimesValidity(event) {
    this.availabilityValid = event.valid;
    this.availabilityDays = event.numdays;
  }

  save() {
    let checkName = this.returnedProfile.teamName.toLowerCase();
        if (this.validate()) {
          this.util.updateAvailabilityToNum(this.returnedProfile);
          this.returnedProfile.teamName_lower = checkName;
          this.team.createTeam(this.returnedProfile).subscribe(
            res => {
              this.auth.setCaptain("true");
              this.auth.setTeam(res.teamName_lower);
              // go to the team profile page.
              this.route.navigate([
                "/teamProfile",
                this.team.routeFriendlyTeamName(res.teamName)
              ]);
            },
            err => {
              console.log(err);
            }
          );
        } else {
          alert("required infomation not included");
        }
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

  errors = [];
  validate() {
    if (this.initialized) {
      this.errors = [];
      let valid = true;
      //validate this user has a discord tag in their profile

      if (!this.captainDiscordTag) {
        valid = false;
        this.errors.push(
          "Discord tag is required for captains please go add it to your profile!"
        );
      }

      //validate team name is there
      if (this.nameControl.hasError("taken")) {
        //do nothing.
      } else if (
        !this.util.returnBoolByPath(this.returnedProfile, "teamName")
      ) {
        this.nameControl.setErrors({ required: true });
        valid = false;
        this.errors.push("Team Name is required!");
      } else {
        let regEx = new RegExp(/[%_\/\\`#]/gm);
        if (regEx.test(this.returnedProfile.teamName)) {
          valid = false;
          this.nameControl.setErrors({ invalidCharacters: true });
          this.errors.push("Team Name contains invalid characters!");
        } else {
          this.nameControl.setErrors(null);
        }
      }

      if (this.tickerControl.errors) {
        let key = Object.keys(this.tickerControl.errors)[0];
        valid = false;
        if (key == "notUnique") {
          this.errors.push("Team Ticker is taken!");
        }
        if (key == "invalidTicker") {
          this.errors.push("Team Ticker is invalid!");
        }
        if (key == "minlength") {
          this.errors.push("Team Ticker is too short!");
        }
        if (key == "required") {
          this.errors.push("Team Ticker is required!");
        }
        if (key == "maxlength") {
          this.errors.push("Team Ticker is too long!");
        }
      }

      //validate that there is at least 1 available day
      if (!this.availabilityValid) {
        valid = false;
      }

      //ensure time zone
      if (
        this.availabilityDays > 0 &&
        !this.util.returnBoolByPath(this.returnedProfile, "timeZone")
      ) {
        this.timeZoneControl.setErrors({ required: true });
        valid = false;
        this.timezoneError = {
          error: true
        };
        this.errors.push(
          "If time availability is input; time zone is required!"
        );
      } else {
        this.timeZoneControl.setErrors(null);
        this.timezoneError = { error: false };
      }

      return valid;
    } else {
      return true;
    }
  }
}
