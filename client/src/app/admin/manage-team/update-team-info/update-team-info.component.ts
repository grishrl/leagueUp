import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { Team } from 'src/app/classes/team.class';
import { FormControl, FormGroup } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { UserService } from 'src/app/services/user.service';
import { ConfirmRemoveMemberComponent } from '../../../modal/confirm-remove-member/confirm-remove-member.component';
import { ChangeCaptainModalComponent } from '../../../modal/change-captain-modal/change-captain-modal.component';
import { DeleteConfrimModalComponent } from '../../../modal/delete-confrim-modal/delete-confrim-modal.component'
import { AuthService } from 'src/app/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: "app-update-team-info",
  templateUrl: "./update-team-info.component.html",
  styleUrls: ["./update-team-info.component.css"]
})
export class UpdateTeamInfoComponent implements OnInit {
  constructor(
    public team: TeamService,
    private admin: AdminService,
    public user: UserService,
    public auth: AuthService,
    public dialog: MatDialog,
    private router: Router
  ) {}

  returnedProfile = new Team(
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

  //methods
  deleteUserButtonOn(player) {
    return this.team.captainLevel(this.returnedProfile, player);
  }

  source = "admin";

  adminRefreshMMR() {
    this.admin.refreshTeamMMR(this.returnedProfile.teamName_lower).subscribe(
      res => {
        this.returnedProfile.teamMMRAvg = res.newMMR.averageMmr;
        this.returnedProfile.hpMmrAvg = res.newMMR.heroesProfileAvgMmr;
        this.returnedProfile.ngsMmrAvg = res.newMMR.ngsAvgMmr;
      },
      err => {
        console.log(err);
      }
    );
  }

  displayMembersLeft: any[] = [];
  displayMembersRight: any[] = [];
  displayPendingMembersLeft: any[] = [];
  displayPendingMembersRight: any[] = [];

  stratifyTeamMembers() {
    this.displayMembersLeft = [];
    this.displayMembersRight = [];
    if (this.returnedProfile.teamMembers.length > 3) {
      let half = Math.round(this.returnedProfile.teamMembers.length / 2);
      for (var i = 0; i < half; i++) {
        this.displayMembersLeft.push(this.returnedProfile.teamMembers[i]);
      }

      for (var j = half; j < this.returnedProfile.teamMembers.length; j++) {
        this.displayMembersRight.push(this.returnedProfile.teamMembers[j]);
      }
    } else {
      this.displayMembersLeft = this.returnedProfile.teamMembers;
      this.displayMembersRight = [];
    }
    //PENDING MEMBERS
    if (
      this.returnedProfile.pendingMembers &&
      this.returnedProfile.pendingMembers.length > 3
    ) {
      let half = Math.round(this.returnedProfile.pendingMembers.length / 2);
      for (var i = 0; i < half; i++) {
        this.displayPendingMembersLeft.push(
          this.returnedProfile.pendingMembers[i]
        );
      }

      for (var j = half; j < this.returnedProfile.pendingMembers.length; j++) {
        this.displayPendingMembersRight.push(
          this.returnedProfile.pendingMembers[j]
        );
      }
    } else {
      this.displayPendingMembersLeft = this.returnedProfile.pendingMembers;
      this.displayPendingMembersRight = [];
    }
  }
  //this method constorls the opening of the delete team confirm modal
  confirm: string;
  openAdminDeleteDialog(): void {
    const dialogRef = this.dialog.open(DeleteConfrimModalComponent, {
      width: "300px",
      data: { confirm: this.confirm }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.toLowerCase() == "delete") {
        this.admin.deleteTeam(this.returnedProfile.teamName_lower).subscribe(
          res => {
            this.router.navigate(["/_admin/manageTeam"]);
          },
          err => {
            console.log(err);
          }
        );
      }
    });
  }

  @Input() set teamName(val) {
    if (val) {
      this.originalName = this.team.realTeamName(val);
      this.init();
    }
  }

  init() {
    let teamToGet = this.returnedProfile.teamName
      ? this.returnedProfile.teamName
      : this.originalName;
    if (teamToGet) {
      this.team.getTeam(teamToGet).subscribe(
        res => {
          if (!res.questionnaire) {
            res.questionnaire = {};
            res.questionnaire.registered = false;
          }
          this.returnedProfile = res;
          this.stratifyTeamMembers();
        },
        err => {
          console.log(err);
        }
      );
    } else {
      alert("Error; Failed Successfully");
    }
  }

  nameControl = new FormControl();

  updateTeamControlGroup = new FormGroup({
    nameControl: this.nameControl
  });

  originalName: string = null;

  ngOnInit() {}

  //this method opens the admin change captain modal
  openAdminCaptainChangeDialog(): void {
    const dialogRef = this.dialog.open(ChangeCaptainModalComponent, {
      width: "450px",
      data: {
        members: this.returnedProfile.teamMembers,
        captain: this.returnedProfile.captain
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null && result != undefined) {
        this.admin
          .changeCaptain(this.returnedProfile.teamName_lower, result)
          .subscribe(
            res => {
              this.returnedProfile = null;
              this.returnedProfile = res;
            },
            err => {
              console.log(err);
            }
          );
      }
    });
  }

  disabled;

  adminSave() {
    this.disabled = true;
    let cptRemoved = Object.assign({}, this.returnedProfile);
    delete cptRemoved.captain;
    this.returnedProfile.teamName_lower = this.returnedProfile.teamName.toLowerCase();
    this.admin.saveTeam(this.originalName, this.returnedProfile).subscribe(
      res => {
        // console.log(res);
        // console.log('team was saved!');
        this.originalName = res.teamName_lower;
        if (!res.questionnaire) {
          res.questionnaire = {};
          res.questionnaire.registered = false;
        }
        this.returnedProfile = res;
      },
      err => {
        console.log(err);
        alert(err.message);
      }
    );
  }

  openConfirmRemove(player): void {
    const openConfirmRemove = this.dialog.open(ConfirmRemoveMemberComponent, {
      width: "450px",
      data: { player: player }
    });

    openConfirmRemove.afterClosed().subscribe(result => {
      if (result != undefined && result != null) {
        if (result == "confirm") {
          this.removeMember(player);
        }
      }
    });
  }

  removeMember(player) {
    //TODO: ADD A CONFIRM HERE
    this.admin
      .removeMembers(this.returnedProfile.teamName_lower, player)
      .subscribe(
        res => {
          // console.log('user removed');
          this.init();
        },
        err => {
          console.log(err);
        }
      );
  }

  forfeit(){
    this.admin.forfeitTeam(this.returnedProfile.teamName).subscribe(
      res=>{
        alert('Team matches forfeited');
      },
      err=>{
        console.log(err);
      }
    )
  }

  removeInvited(player){

    this.admin
      .removeInvitedMembers(this.returnedProfile.teamName_lower, player)
      .subscribe(
        (res) => {
          // console.log('user removed');
          this.init();
        },
        (err) => {
          console.log(err);
        }
      );
  }
}
