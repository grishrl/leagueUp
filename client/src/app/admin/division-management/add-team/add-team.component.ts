import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { indexOf } from 'lodash';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-add-team',
  templateUrl: './add-team.component.html',
  styleUrls: ['./add-team.component.css']
})
export class AddTeamComponent implements OnInit {

  //component properties
  undivisionTeams //local variable for holding/displaying teams that have no division
  divisions //local variable for holding/displaying the divisions
  selectedTeams: any = []; //local variable holds the selected teams to assign to a division
  selectedDiv //local variable holds the info of the selected div to add teams to

  constructor(private admin: AdminService, public teamService:TeamService) { }

  ngOnInit() {
    //set the local vars to empty / uninitialised
    this.selectedTeams = [];
    this.selectedDiv = undefined;
    this.undivisionTeams=[];

    //get teams and divisions
    this.admin.getTeamsNotDivisioned().subscribe(res => {
      this.undivisionTeams = res;
      this.undivisionTeams = this.undivisionTeams.sort( (a,b)=>{
        if (a.teamMMRAvg < b.teamMMRAvg) {
          return -1;
        }
        if (a.teamMMRAvg > b.teamMMRAvg) {
          return 1
        }
        return 0;
      } )
    }, (err) => {
      console.warn(err)
    });
    this.divisions=[];
    this.admin.getDivisionList().subscribe(res => {
      this.divisions = res;
    }, (err) => {
      console.warn(err);
    })

  }

  //method accepts team name and toggles it's inclusion in the array of teams to be added
  teamSelected(team) {
    //if team is in the array, remove and deactivate it
    let index = indexOf(this.selectedTeams, team)
    if (index > -1) {
      this.selectedTeams.splice(index, 1);
    } else {
      this.selectedTeams.push(team);
    }
  }

  //sets the selected division variable
  divSelected(div) {
    this.selectedDiv = div;
  }

  //method for selective styling of team elements, returns true if team is in the selectedArray ,false if not
  isSelected(team): boolean {
    let index = indexOf(this.selectedTeams, team)
    if (index > -1) {
      return true;
    } else {
      return false;
    }
  }

  //method for selectinve styling of the division element, returns true if div is the selectedDiv, false if not
  isDivSelected(div): boolean {
    if (this.selectedDiv == div) {
      return true;
    } else {
      return false;
    }
  }

  //method to handle assigning selected teams to selected division
  divisionTeams() {
    this.admin.divisionTeam(this.selectedTeams, this.selectedDiv.divisionConcat).subscribe(
      res => {
        this.ngOnInit();
      }, (err) => {
        console.warn(err)
      }
    );
  }

}
