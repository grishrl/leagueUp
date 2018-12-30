import { Component, OnInit, Input } from '@angular/core';
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
    if (this.provDiv == undefined && this.provDiv == null) {
      this.divisionService.getDivisionInfo().subscribe((res) => {
        this.divisions = res;
      }, (err) => {
        console.log(err);
      })
    }
  }

  provDiv

  @Input() set division(div){
    if(div!=undefined && div != null){
      this.provDiv = div;
      this.calculateRounds();
    }
  }

  matches:any[]=[];
  selectedDivision:any
  rounds: number[] = [];
  
  calculateRounds() {
    let roundNumber = 0;
    if (this.provDiv != undefined && this.provDiv != null && this.provDiv.teams != undefined && this.provDiv.teams != null) {
      roundNumber = this.provDiv.teams.length - 1;
    } else if (this.selectedDivision != null && this.selectedDivision != undefined && this.selectedDivision.teams != undefined && this.selectedDivision.teams != null){
      roundNumber = this.selectedDivision.teams.length - 1;
    }
    this.rounds = [];
    this.matches=[];
    if (roundNumber == 0){
      roundNumber = 1;
    }
    for (let i = 0; i < roundNumber; i++) {
      this.rounds.push(i + 1);
    }
  }

  selectedRound:number
  getMatches(){
    let div;
    if(this.provDiv!=undefined&&this.provDiv!=null){
      div=this.provDiv.divisionConcat;
    }else{
      div = this.selectedDivision.divisionConcat;
    }

    let season = 6;
    this.scheduleService.getScheduleMatches(season, div, this.selectedRound).subscribe(
      res=>{ this.matches = res },
      err=>{ console.log(err)}
    )
  }

}
