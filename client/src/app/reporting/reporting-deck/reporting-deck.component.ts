import { Component, OnInit, Input } from '@angular/core';

declare var heroprotocol: any;


@Component({
  selector: 'app-reporting-deck',
  templateUrl: './reporting-deck.component.html',
  styleUrls: ['./reporting-deck.component.css']
})
export class ReportingDeckComponent implements OnInit {
  
  recMatch
  @Input() set match(match){
    if(match!=null && match != undefined){
      this.recMatch = match;
    }
  }
  constructor() { }

  ngOnInit() {
  }

  homeScore: number
  awayScore: number

  scoreSelected(changed) {
    console.log(changed, this.homeScore, this.awayScore);
    if(changed=='home'){
      if (this.homeScore == 2) {
        this.awayScore = 0;
      } else if (this.homeScore == 1) {
        this.awayScore = 1;
      } else if (this.homeScore == 0) {
        this.awayScore = 2;
      }
    }else{
      if (this.awayScore == 2) {
        this.homeScore = 0;
      } else if (this.awayScore == 1) {
        this.homeScore = 1;
      } else if (this.awayScore == 0) {
        this.homeScore = 2;
      }
    }
  }

  show:boolean=false;

  showHide(){
    this.show = !this.show;
  }

  report() {

  }

}
