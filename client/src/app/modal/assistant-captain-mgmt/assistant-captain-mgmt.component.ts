import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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

  disableFn(player){
    let ret = false;
    if (this.data.assistantCaptain.indexOf(player)>-1){
      ret = false;
    } else if (player == this.data.captain){
      ret = true;
    }else{
      ret = this.data.assistantCaptain.length >= 2
    }
    return ret;
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
