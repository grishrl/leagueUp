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

  }

  selected(selectedDivision){
    let number;
    this.weeks = [];
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

    let date = new Date(this.friendlyDate);
    date.setHours(23);
    date.setMinutes(59);

    let time = date.getTime();


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
