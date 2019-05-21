import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { Team } from 'src/app/classes/team.class';
import { FormControl } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { UserService } from 'src/app/services/user.service';
import { ConfirmRemoveMemberComponent } from '../../../modal/confirm-remove-member/confirm-remove-member.component';
import { ChangeCaptainModalComponent } from '../../../modal/change-captain-modal/change-captain-modal.component';
import { DeleteConfrimModalComponent } from '../../../modal/delete-confrim-modal/delete-confrim-modal.component'
import { AuthService } from 'src/app/services/auth.service';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-update-team-info',
  templateUrl: './update-team-info.component.html',
  styleUrls: ['./update-team-info.component.css']
})
export class UpdateTeamInfoComponent implements OnInit {

  constructor(public team: TeamService, private admin: AdminService, public user: UserService, public auth: AuthService, public dialog: MatDialog) { }

  returnedProfile = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

  adminRefreshMMR() {
    this.admin.refreshTeamMMR(this.returnedProfile.teamName_lower).subscribe(
      (res) => {
        this.returnedProfile.teamMMRAvg = res.newMMR;
      },
      (err) => {
        console.log(err);
      }
    )
  }

  openAdminDeleteDialog(): void {
    const dialogRef = this.dialog.open(DeleteConfrimModalComponent, {
      width: '300px',
      data: { confirm: this.confirm }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.toLowerCase() == 'delete') {
        this.admin.deleteTeam(this.returnedProfile.teamName_lower).subscribe(
          res => {
            this.router.navigate(['/_admin/manageTeam']);

          }, err => {
            console.log(err);
          }
        )
      }
    });
  }

  @Input() set teamName(val){
    if(val){
      this.originalName = this.team.realTeamName(val);
      this.init()
    }
  }

  init(){
    let teamToGet = this.returnedProfile.teamName ? this.returnedProfile.teamName : this.originalName;
    if (teamToGet){
      this.team.getTeam(teamToGet).subscribe(
        res => {
          this.returnedProfile = res;
        },
        err => {
          console.log(err);
        }
      )
    }else{
      alert("Error; Failed Successfully");
    }

  }

  nameControl = new FormControl({ value: '' });

  originalName: string = null;

  ngOnInit() {

  }

  //this method opens the admin change captain modal
  openAdminCaptainChangeDialog(): void {
    const dialogRef = this.dialog.open(ChangeCaptainModalComponent, {
      width: '450px',
      data: { members: this.returnedProfile.teamMembers, captain: this.returnedProfile.captain }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null && result != undefined) {
        this.admin.changeCaptain(this.returnedProfile.teamName_lower, result).subscribe((res) => {
          this.returnedProfile = null;
          this.returnedProfile = res;
        }, (err) => {
          console.log(err);
        })
      }
    });
  }

  // this model change method will be bound to the name change input, so we can update the lower case name along with the display name
  nameChange() {
    if (this.returnedProfile.teamName != undefined && this.returnedProfile.teamName != null) {
      if (this.returnedProfile.teamName != this.returnedProfile.teamName_lower) {
        this.returnedProfile.teamName_lower = this.returnedProfile.teamName.toLowerCase();
      }
    }

  }

  disabled

  adminSave() {
      this.disabled = true;
      let cptRemoved = Object.assign({}, this.returnedProfile);
      delete cptRemoved.captain;
      this.admin.saveTeam(this.originalName, this.returnedProfile).subscribe((res) => {
        // console.log('team was saved!');
        this.originalName = res.teamName_lower;
        this.returnedProfile = res;
      }, (err) => {
        console.log(err);
        alert(err.message);
      });
  }

  openConfirmRemove(player): void {
    const openConfirmRemove = this.dialog.open(ConfirmRemoveMemberComponent, {
      width: '450px',
      data: { player: player }
    });

    openConfirmRemove.afterClosed().subscribe(result => {
      if (result != undefined && result != null) {
        if (result == 'confirm') {
          this.removeMember(player)
        }

      }
    });
  }

  removeMember(player) {
    //TODO: ADD A CONFIRM HERE
      this.admin.removeMembers(this.returnedProfile.teamName_lower, player).subscribe(
        (res) => {
          // console.log('user removed');
          this.init();
        },
        (err) => {
          console.log(err);
        }
      )
  }
}
