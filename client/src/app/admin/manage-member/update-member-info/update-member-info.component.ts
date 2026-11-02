import { Component, OnInit, Input } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { Profile } from 'src/app/classes/profile.class';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: "app-update-member-info",
  templateUrl: "./update-member-info.component.html",
  styleUrls: ["./update-member-info.component.css"],
})
export class UpdateMemberInfoComponent implements OnInit {
  constructor(private admin: AdminService, private user: UserService) {}

  returnedProfile = new Profile(
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
    null,
    null,
    null
  );
  ngOnInit() {}

  _displayName;
  @Input() set displayname(val) {
    if (val) {
      this._displayName=val;
      this.initOnDemand();
    }
  }

  updateNotes;

  private initOnDemand() {
    this.user.getUser(this._displayName).subscribe(
      (res) => {
        this.returnedProfile = res;
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  refreshNotes(retVal) {

    this.updateNotes=Date.now();
  }

  receiveUser(user) {
    this.user.getUser(user).subscribe(
      (res) => {

        this.returnedProfile.accountAlias = res._id;
      },
      (err) => {
        console.error(err);
      }
    );
  }

  removeTeam() {
    this.admin
      .removeMembers(
        this.returnedProfile.teamName,
        this.returnedProfile.displayName
      )
      .subscribe(
        {
          next:(res)=>{
          this.returnedProfile.teamId = null;
          this.returnedProfile.teamName = null;
          },
          error: err=>{
            alert("There was an error in removing this user -- this typically occurs when we can't find the user on the team.  We've attempted to clean the user up.");
            console.warn(err);
            this.initOnDemand();
          }
        }
      );
  }

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

  adminSave() {
    this.admin.saveUser(this.returnedProfile).subscribe(
      (res) => {},
      (err) => {
        console.warn(err);
      }
    );
  }
}
