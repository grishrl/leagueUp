import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-remove-member',
  templateUrl: './confirm-remove-member.component.html',
  styleUrls: ['./confirm-remove-member.component.css']
})
export class ConfirmRemoveMemberComponent implements OnInit {
  selected: string
  newCaptain: string
  memberSelected: string
  constructor(
    public dialogRef: MatDialogRef<ConfirmRemoveMemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: dataModel) {

  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}

export interface dataModel {
  player: any
}
