import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-change-captain-modal',
  templateUrl: './change-captain-modal.component.html',
  styleUrls: ['./change-captain-modal.component.css']
})

export class ChangeCaptainModalComponent implements OnInit {
  selected:string
  newCaptain:string
  memberSelected:string
  constructor(
    public dialogRef: MatDialogRef<ChangeCaptainModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: dataModel) {

     }


  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}

export interface dataModel {
  members: any,
  captain: any
}
