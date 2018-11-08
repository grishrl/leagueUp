import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialogOverviewExampleDialog } from '../../profile-edit/profile-edit.component';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-delete-team',
  templateUrl: './delete-team.component.html',
  styleUrls: ['./delete-team.component.css']
})
export class DeleteTeamComponent implements OnInit {

  constructor(public dialog: MatDialog, private admin: AdminService) { }

  recievedProfile
  turnOnForm: boolean = false;

  receiveTeam(userRec) {
    if (userRec != null && userRec != undefined) {
      console.log(userRec);
      this.turnOnForm = true;
      this.recievedProfile = userRec;
    }
  }

  confirm: string
  openDialog(): void {

    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '300px',
      data: { confirm: this.confirm }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

      if (result.toLowerCase() == 'delete') {
        console.log('delete this account!');
        this.admin.deleteTeam(this.recievedProfile).subscribe(
          res => {
            this.turnOnForm = false;
            this.recievedProfile = null;
            console.log('deleted!');
          }, err => {
            console.log(err);
          }
        )
      }
    });
  }


  ngOnInit() {
  }

}
