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

  divisions:any = [];

  ngOnInit() {
    this.adminService.getDivisionList().subscribe((res) => {
      this.divisions = res;
    }, (err) => {
      console.log(err);
    })
  }
  
  selectedDiv = null;
  selectedDivision
  selected(){
    this.selectedDiv = Object.assign({},this.selectedDivision);
  }


  selectedTeams: any = [];
  teamSelected(team) {
    //if team is in the array, remove and deactivate it
    // console.log('clicked')
    let index = indexOf(this.selectedTeams, team)
    if (index > -1) {
      this.selectedTeams.splice(index, 1);
    } else {
      this.selectedTeams.push(team);
    }
    // console.log(this.selectedTeams);
  }
  isSelected(team): boolean {
    let index = indexOf(this.selectedTeams, team)
    if (index > -1) {
      return true;
    } else {
      return false;
    }
  }

  removeTeams(){
    this.adminService.removeTeams(this.selectedTeams, this.selectedDiv.divisionConcat).subscribe( (res)=>{
      //TODO : see if anything needs to be done here
      console.log(res);
    }, (err)=>{
      console.log(err);
    })
  }
}
