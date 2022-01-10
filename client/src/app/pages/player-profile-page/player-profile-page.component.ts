import { Component, OnInit, Input} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Profile } from '../../classes/profile.class';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { merge } from 'lodash';
import { Router } from '@angular/router';
import { DeleteConfrimModalComponent } from '../../modal/delete-confrim-modal/delete-confrim-modal.component'
import { UtilitiesService } from '../../services/utilities.service';
import { HeroesProfileService } from '../../services/heroes-profile.service';
import { TeamService } from '../../services/team.service';
import { AdminService } from '../../services/admin.service';
import { MvpService } from 'src/app/services/mvp.service';
import { TabTrackerService } from 'src/app/services/tab-tracker.service';

@Component({
  selector: "app-player-profile-page",
  templateUrl: "./player-profile-page.component.html",
  styleUrls: ["./player-profile-page.component.css"],
})
export class PlayerProfile implements OnInit {
  navigationSubscription;
  mvpCounts = 0;

  constructor(
    public user: UserService,
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public util: UtilitiesService,
    public hotsProfile: HeroesProfileService,
    public team: TeamService,
    private admin: AdminService,
    private mvpServ: MvpService,
    private tabTracker: TabTrackerService
  ) {
    //so that people can manually enter different tags from currently being on a profile page; we can reinitialize the component with the new info
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.displayName = user.realUserName(this.route.snapshot.params["id"]);
        this.init();
      }
    });
  }

  //active tab
  index = 0;
  hpProfileLink;

  setTab(ind) {
    this.tabTracker.lastRoute = "profile";
    this.tabTracker.lastTab = ind;
    this.index = ind;
  }

  errors = [];

  //this variable is used in case someone re-routes to profile from a profile
  displayName: string;
  //variable to hold profile returned from server
  returnedProfile:Profile = this.user.returnNullUser();

  //temp profile; stores old information in case a user hits cancel we have a copy to replace errant changes.
  tempProfile: Profile;

  //if this component is embedded we can include a source; special flags for 'admin' to allow the admin options to open
  embedSource: string = "";
  @Input() set source(_source) {
    this.embedSource = _source;
  }

  //profile edit is turned off by default;
  disabled = true;

  timesAvailControl = new FormControl();

  profileForm = new FormGroup({
    timeAvail: this.timesAvailControl,
  });

  //admin profile save method
  adminSave() {
    this.admin.saveUser(this.returnedProfile).subscribe(
      (res) => {},
      (err) => {
        console.warn(err);
      }
    );
  }
  //admin method for removing a team from a player profile
  removeTeam() {
    this.admin
      .removeMembers(
        this.returnedProfile.teamName,
        this.returnedProfile.displayName
      )
      .subscribe(
        (res) => {
          this.returnedProfile.teamId = null;
          this.returnedProfile.teamName = null;
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  discordTagFormControl = new FormControl({ value: "", disabled: false }, [
    this.discordPatternValidator,
  ]);

  discordPatternValidator(control: FormControl) {
    let discordTag = control.value;
    if (discordTag) {
      if (discordTag && discordTag.indexOf("#") <= 0) {
        return { invalidTag: true };
      } else {
        let tagArr = discordTag.split("#");
        let regex = new RegExp(/(\d{4})/);
        if (tagArr[1].length == 4 && regex.test(tagArr[1])) {
          return null;
        } else {
          return { invalidTag: true };
        }
      }
    } else {
    }
  }

  //admin method for adding a team to a player profile
  newTeam(team) {
    this.admin.manualTeamAdd(this.returnedProfile.displayName, team).subscribe(
      (res) => {
        this.returnedProfile.teamId = res._id;
        this.returnedProfile.teamName = res.teamName;
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  //dialog options for deleting a user account
  confirm: string;

  openDialog(): void {
    const dialogRef = this.dialog.open(DeleteConfrimModalComponent, {
      width: "300px",
      data: { confirm: this.confirm },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.toLowerCase() == "delete") {
        this.user.deleteUser().subscribe(
          (res) => {
            this.auth.destroyAuth("/logout");
          },
          (err) => {
            console.warn(err);
          }
        );
      }
    });
  }

  //if the user is on a team do not display the looking for group button
  hideLookingForGroup() {
    return !this.auth.getTeam();
  }

  //enable editing for profile, create a copy of current data
  openEdit() {
    this.disabled = false;

    this.tempProfile = this.user.returnNullUser();

    merge(this.tempProfile, this.returnedProfile);
  }

  //disabled editing for profile, replace any changes with original copy
  cancel() {
    this.returnedProfile = Object.assign(this.user.returnNullUser(), this.tempProfile);
    this.disabled = true;
  }

  save() {
    if (this.validate()) {
      this.util.updateAvailabilityToNum(this.returnedProfile);

      this.user.saveUser(this.returnedProfile).subscribe((res) => {
        if (res) {
          this.disabled = true;
        } else {
          alert("error");
        }
      });
    } else {
      console.warn("the data was invalid we cant save");
    }
  }

  updateUserMMR() {
    this.user.updateUserMmr().subscribe((res) => {
      merge(this.returnedProfile, res.additional);
    });
  }

  //init method ; checks to see if the name we're getting comes from the router URL, or the displayName property
  ngOnInit() {}

  private init(){

    this.returnedProfile = this.user.returnNullUser();
    this.returnedProfile.verifiedRankHistory = null;
    // this.returnedProfile.verifiedRankHistory = [];

    this.hpProfileLink = '';
    this.discordTagFormControl.markAsTouched();
    this.user.getUser(this.displayName).subscribe((res) => {
      //i am so smart that I have to put this fix in place to validate that I have real roles.
      if (false == this.util.returnBoolByPath(res, "role")) {
        res.role = this.user.returnNullUser().role;
      }
      //i am so smart that I have to put this fix in place to validate that I have real availability.
      if (false == this.util.returnBoolByPath(res, "availability")) {
        res.availability = this.user.returnNullUser().availability;
      }
      this.returnedProfile = res;
      this.index = this.tabTracker.returnTabIndexIfSameRoute("profile");
      this.hotsProfile.getHPProfileLinkStream.subscribe((subj) => {
        this.hpProfileLink = subj;
      });
      this.hotsProfile.getHPProfileLink(
        this.returnedProfile.toonHandle,
        this.returnedProfile.displayName
      );
      this.mvpServ.getMvpById("player_id", this.returnedProfile._id).subscribe(
        (res) => {
          if (res) {
            this.mvpCounts = res.length;
          }
        },
        (err) => {
          console.warn(err);
        }
      );
    });

  }

  //method for receiving times-availability object back from the avail-component; checks to make sure it retuns times meeting criteria
  validAvailTimes: boolean = false;
  validAvailDays: number = 0;
  recieveAvailTimeValidity(event) {
    this.validAvailTimes = event.valid;
    this.validAvailDays = event.numdays;
    if (event.valid) {
      this.timesAvailControl.setErrors(null);
    } else {
      this.timesAvailControl.setErrors({ invalid: true });
    }
    if (
      event.numdays > 0 &&
      this.isNullOrEmpty(this.returnedProfile.timeZone)
    ) {
    } else {
    }
  }

  timezoneError;
  discordTagError;

  //check the return profile object to make sure it's valid for saving
  validate() {
    let valid = true;
    this.errors = [];
    if (this.discordTagFormControl.invalid) {
      valid = false;
      this.errors.push("Discord tag is invalid");
    }
    //ensure time zone
    if (
      this.validAvailDays > 0 &&
      this.isNullOrEmpty(this.returnedProfile.timeZone)
    ) {
      valid = false;
      this.timezoneError = {
        error: true,
      };
      this.errors.push("You must select timezone with times available");
    } else {
      this.timezoneError = { error: false };
    }
    return valid;
  }

  //estimate the total games played by this player
  estimateGamesPlayed() {
    let count = 0;
    if (
      this.returnedProfile.replays &&
      this.returnedProfile.replays.length > 0
    ) {
      count += this.returnedProfile.replays.length;
    }
    if (
      this.returnedProfile.replayArchive &&
      this.returnedProfile.replayArchive.length > 0
    ) {
      this.returnedProfile.replayArchive.forEach((season) => {
        count += season.replays.length;
      });
    }
    return count;
  }

  isNullOrEmpty(dat): boolean {
    if (dat == null || dat == undefined) {
      return true;
    }
    if (Array.isArray(dat)) {
      if (dat.length == 0) {
        return true;
      }
    } else if (typeof dat == "object") {
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

  ngOnDestroy() {
    this.navigationSubscription.unsubscribe();
  }
}
