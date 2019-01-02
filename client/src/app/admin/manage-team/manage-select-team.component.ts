import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TeamService } from '../../services/team.service';
import { DialogOverviewExampleDialog } from '../../profile-edit/profile-edit.component';
import { ChangeCaptainModalComponent } from '../../modal/change-captain-modal/change-captain-modal.component';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-select-team',
  templateUrl: './manage-select-team.component.html',
  styleUrls: ['./manage-select-team.component.css']
})
export class ManageSelectTeamComponent implements OnInit {

  constructor(public dialog: MatDialog, private admin: AdminService, private team: TeamService, private router:Router) { }

  //component properties
  recievedProfile
  turnOnForm: boolean = false;
  pulledProfile:any
  teams:any[]=[];

  //callback function that is passed to the search component, accepts the profile selected from that component
  //santaizes the returned profile for URL and routes to that profile 
  receiveTeam(teamProf) {
    if (teamProf != null && teamProf != undefined) {
      this.goView(this.team.routeFriendlyTeamName(teamProf.teamName_lower));
    }
  }

  //function tied to the list of teams, accepts team in scope, 
  //sanatizes the team name and routes to the proper endpoint
  selectedFromList(prof){
    this.goView(this.team.routeFriendlyTeamName(prof.teamName_lower));
  }

  //takes id and routes to the manageTeam of id
  goView(id){
    this.router.navigate(['_admin/manageTeam/', id]);
  }

  // dont believe this is used anywhere
  // openChangeCaptainDialog():void{
  //   console.log('yep');
  //   const dialogRef = this.dialog.open(ChangeCaptainModalComponent, {
  //     width: '450px',
  //     data: { members: this.pulledProfile.teamMembers, captain: this.pulledProfile.captain }
  //   });

  //   dialogRef.afterClosed().subscribe(result=>{
  //     if(result!=null&&result!=undefined){
  //       this.admin.changeCaptain(this.pulledProfile.teamName_lower, result).subscribe( (res)=>{
          
  //         // this.turnOnForm = false;
  //         this.recievedProfile = null;
  //         this.recievedProfile = res;
  //         this.pulledProfile = res;
  //       },(err)=>{
  //         console.log(err);
  //       } )
  //     }
  //   });
  // }

  // confirm: string
  // openDialog(): void {

  //   const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
  //     width: '300px',
  //     data: { confirm: this.confirm }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
      

  //     if (result.toLowerCase() == 'delete') {
        
  //       this.admin.deleteTeam(this.recievedProfile).subscribe(
  //         res => {
  //           this.turnOnForm = false;
  //           this.recievedProfile = null;
            
  //         }, err => {
  //           console.log(err);
  //         }
  //       )
  //     }
  //   });
  // }


  ngOnInit() {
    //returns the teams for displaying in list. 
    //TODO: check into pagination 
    this.admin.getTeams().subscribe(
      (res)=>{
        this.teams = res;
      },
      (err)=>{
        console.log(err);
      }
    )
  }

}
