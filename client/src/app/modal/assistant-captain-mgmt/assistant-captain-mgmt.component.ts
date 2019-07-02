import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-assistant-captain-mgmt',
  templateUrl: './assistant-captain-mgmt.component.html',
  styleUrls: ['./assistant-captain-mgmt.component.css']
})
export class AssistantCaptainMgmtComponent implements OnInit {

  selected: string
  newCaptain: string
  memberSelected: string
  constructor(
    public dialogRef: MatDialogRef<AssistantCaptainMgmtComponent>,
    @Inject(MAT_DIALOG_DATA) public data: dataModel) {

  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    console.log(this.data);
    if(!this.data.assistantCaptain){
      this.data.assistantCaptain = [];
    }
  }

  disableSelect(name){
    // if(false){
    //   return true;
    // }else{
    //   return !!(this.data.assistantCaptain.indexOf(name)>-1);
    // }
  }

  updateSelected(name){
    let ind = this.data.assistantCaptain.indexOf(name);
    if (ind > -1){
      this.data.assistantCaptain.splice(ind, 1);
    }else{
      this.data.assistantCaptain.push(name);
    }
  }



}

export interface dataModel {
  members: any,
  captain:any,
  assistantCaptain:any
}
