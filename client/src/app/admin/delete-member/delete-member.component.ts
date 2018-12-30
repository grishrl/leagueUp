import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogOverviewExampleDialog } from '../../profile-edit/profile-edit.component'; 
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-delete-member',
  templateUrl: './delete-member.component.html',
  styleUrls: ['./delete-member.component.css']
})
export class DeleteMemberComponent implements OnInit {

  constructor(public dialog: MatDialog, private admin:AdminService) { }

  recievedProfile
  turnOnForm:boolean=false;

  receiveUser(userRec){
    if (userRec != null && userRec!=undefined){
      // console.log(userRec);
      this.turnOnForm = true;
      this.recievedProfile = userRec;
    }
  }

  confirm:string
  openDialog(): void {

    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '300px',
      data: { confirm: this.confirm }
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');

      if (result.toLowerCase() == 'delete') {
        // console.log('delete this account!');
        this.admin.deleteUser(this.recievedProfile).subscribe(
          res => {
            this.turnOnForm = false;
            this.recievedProfile = null;
            // console.log('deleted!');
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

// @Component({
//   selector: 'dialog-overview-example-dialog',
//   templateUrl: '../../profile-edit/dialog-overview-example-dialog.html',
// })
// export class DialogOverviewExampleDialog {

//   constructor(
//     public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
//     @Inject(MAT_DIALOG_DATA) public data: object) { }

//   onNoClick(): void {
//     this.dialogRef.close();
//   }

// }
