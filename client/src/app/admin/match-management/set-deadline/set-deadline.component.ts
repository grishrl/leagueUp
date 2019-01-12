import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-set-deadline',
  templateUrl: './set-deadline.component.html',
  styleUrls: ['./set-deadline.component.css']
})
export class SetDeadlineComponent implements OnInit {
  divisions
  selectedDivision
  weeks:any[]=[];
  friendlyDate
  selectedWeek
  constructor( private admin:AdminService) { }

  ngOnInit() {
    this.divisions = [];
    this.admin.getDivisionList().subscribe(res => {
      this.divisions = res;
    }, (err) => {
      console.log(err);
    })
  }

  selected(selectedDivision){
    let number;
    this.selectedDivision = selectedDivision;
    if(selectedDivision.teams % 2 == 0){
      number = selectedDivision.teams.length-1;
    }else{
      number = selectedDivision.teams.length;
    }
    for(var i = 0; i<number; i++){
      this.weeks.push(i+1);
    }
  }

  createDeadline(){
    

    this.friendlyDate.setHours(23);
    this.friendlyDate.setMinutes(59);

    let time = this.friendlyDate.getTime();

    
    if (this.selectedDivision.divisionConcat && time && this.selectedWeek){
      this.admin.setScheduleDeadline(this.selectedDivision.divisionConcat, time, this.selectedWeek).subscribe( res=>{
      console.log(res)
    }, err=>{
      console.log(err);
    })
    }else{
      alert('Input missing');
    } 


  }

}
