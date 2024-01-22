import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-confrim-modal',
  templateUrl: './delete-confrim-modal.component.html',
  styleUrls: ['./delete-confrim-modal.component.css']
})
export class DeleteConfrimModalComponent {

  constructor(
    public dialogRef: MatDialogRef<DeleteConfrimModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
export interface DialogData {
  confirm: string;
}
