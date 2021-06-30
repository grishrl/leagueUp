import { Component, OnInit } from '@angular/core';
import { indexOf } from 'lodash';
import { AdminService } from 'src/app/services/admin.service';


@Component({
  selector: 'app-remove-team',
  templateUrl: './remove-team.component.html',
  styleUrls: ['./remove-team.component.css']
})
export class RemoveTeamComponent implements OnInit {

  constructor(private adminService:AdminService) { }

  //component properties
  divisions:any = [];
  selectedDiv = null;
  selectedDivision
  selectedTeams: any = [];

  ngOnInit() {
  }

  //Assings the local property selectedDiv to a copy of the division chose.
  selected(div){
    this.selectedDiv = Object.assign({}, div);
  }


  //toggles provided team into or out of the selectedTeams array
  teamSelected(team) {
    //if team is in the array, remove it
    let index = indexOf(this.selectedTeams, team)
    if (index > -1) {
      this.selectedTeams.splice(index, 1);
    } else { //else push the team into the array
      this.selectedTeams.push(team);
    }
  }
  //function accepts team and returns true if it is in the selected array - conditional styling for view
  isSelected(team): boolean {
    let index = indexOf(this.selectedTeams, team)
    if (index > -1) {
      return true;
    } else {
      return false;
    }
  }

  //calls the admin service to remove the selected teams from the selected division
  removeTeams(){
    this.adminService.removeTeams(this.selectedTeams, this.selectedDiv.divisionConcat).subscribe( (res)=>{
      this.selectedDiv = null;
      this.selectedTeams = [];
    }, (err)=>{
      console.warn(err);
    })
  }
}
