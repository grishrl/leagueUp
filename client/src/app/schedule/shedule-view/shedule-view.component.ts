import { Component, OnInit } from '@angular/core';
import { DivisionService } from 'src/app/services/division.service';
import { ScheduleService } from 'src/app/services/schedule.service';

@Component({
  selector: 'app-shedule-view',
  templateUrl: './shedule-view.component.html',
  styleUrls: ['./shedule-view.component.css']
})
export class SheduleViewComponent implements OnInit {

  constructor(private divisionService: DivisionService, private scheduleService: ScheduleService) { }
  divisions:any=[];
  ngOnInit() {
    this.divisionService.getDivisionInfo().subscribe((res) => {
      this.divisions = res;
    }, (err) => {
      console.log(err);
    })
  }

  matches:any[]=[];
  selectedDivision:any
  rounds: number[] = [];
  
  calculateRounds() {
    let roundNumber = this.selectedDivision.teams.length - 1;
    this.rounds = [];
    this.matches=[];
    for (let i = 0; i < roundNumber; i++) {
      this.rounds.push(i + 1);
    }
  }

  selectedRound:number
  getMatches(){
    let season = 6;
    this.scheduleService.getScheduleMatches(season, this.selectedDivision.divisionConcat, this.selectedRound).subscribe(
      res=>{ this.matches = res },
      err=>{ console.log(err)}
    )
  }

}
