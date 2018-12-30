import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TeamService } from '../../services/team.service';
import { DialogOverviewExampleDialog } from '../../profile-edit/profile-edit.component';
import { ChangeCaptainModalComponent } from '../../modal/change-captain-modal/change-captain-modal.component';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-delete-team',
  templateUrl: './delete-team.component.html',
  styleUrls: ['./delete-team.component.css']
})
export class DeleteTeamComponent implements OnInit {

  constructor(public dialog: MatDialog, private admin: AdminService, private team: TeamService) { }

  recievedProfile
  turnOnForm: boolean = false;
  pulledProfile:any

  receiveTeam(userRec) {
    if (userRec != null && userRec != undefined) {
      this.turnOnForm = true;
      this.recievedProfile = userRec;
    }
  }

  openChangeCaptainDialog():void{
    const dialogRef = this.dialog.open(ChangeCaptainModalComponent, {
      width: '450px',
      data: { members: this.pulledProfile.teamMembers, captain: this.pulledProfile.captain }
    });

    dialogRef.afterClosed().subscribe(result=>{
      if(result!=null&&result!=undefined){
        this.admin.changeCaptain(this.pulledProfile.teamName_lower, result).subscribe( (res)=>{
          
          // this.turnOnForm = false;
          this.recievedProfile = null;
          this.recievedProfile = res;
          this.pulledProfile = res;
        },(err)=>{
          console.log(err);
        } )
      }
    });
  }

  confirm: string
  openDialog(): void {

    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '300px',
      data: { confirm: this.confirm }
    });

    dialogRef.afterClosed().subscribe(result => {
      

      if (result.toLowerCase() == 'delete') {
        
        this.admin.deleteTeam(this.recievedProfile).subscribe(
          res => {
            this.turnOnForm = false;
            this.recievedProfile = null;
            
          }, err => {
            console.log(err);
          }
        )
      }
    });
  }

  //TODO:  INVESTIGATE THIS ...
  save(){
    console.log( 'you clicked save ');
    console.log('pulledProfile:',this.pulledProfile);
    console.log('recivedProfile:', this.recievedProfile);
  }


  ngOnInit() {
  }

}
