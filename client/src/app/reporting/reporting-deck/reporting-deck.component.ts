import { Component, OnInit, Input } from '@angular/core';
import { ngf } from 'angular-file';
import { ScheduleService } from 'src/app/services/schedule.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-reporting-deck',
  templateUrl: './reporting-deck.component.html',
  styleUrls: ['./reporting-deck.component.css']
})
export class ReportingDeckComponent implements OnInit {
   
  hideButton:boolean=false;
  recMatch
  @Input() set match(match){
    if(match!=null && match != undefined){
      console.log(match);
      this.recMatch = match;
    }
    if(this.recMatch.home.score){
      this.homeScore = this.recMatch.home.score;
    }
    if(this.recMatch.reported){
      this.hideButton = true;
      this.formControlsDisable();
      
    }
  }
  constructor(private scheduleService: ScheduleService) { }

  formControlsDisable(){
    this.awayScoreControl.disable();
    this.homeScoreControl.disable();
    this.replay1Control.disable();
    this.replay2Control.disable();
  }

  hideReplaySubmit(){
    if(this.recMatch.replays){
      return true;
    }
    return false;
  }

  awayScoreControl = new FormControl('', [
    Validators.required
  ]);
  homeScoreControl = new FormControl('', [
    Validators.required
  ]);
  replay1Control = new FormControl('', [
    Validators.required
  ]); 
  replay2Control = new FormControl('', [
    Validators.required
  ]);

  reportForm = new FormGroup({
    awayScore: this.awayScoreControl,
    homeScore: this.homeScoreControl,
    replay1: this.replay1Control,
    replay2: this.replay2Control
  })

  ngOnInit() {
  }

  homeScore: number
  awayScore: number
  replay1:any
  replay2:any

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

  parseFile(replays){
    console.log(replays);
  }

  show:boolean=false;

  showHide(){
    this.show = !this.show;
  }

  report() {
    this.recMatch.homeScore = this.homeScore;
    this.recMatch.awayScore = this.awayScore;
    console.log(this.replay1, this.replay2, this.recMatch);

    let report = {
      matchId:this.recMatch.matchId,
      homeTeamScore:this.homeScore,
      awayTeamScore:this.awayScore
    }
    if(this.replay1 != undefined || this.replay1 != null){
      report['replay1'] = this.replay1;
    }
    if (this.replay2 != undefined || this.replay2 != null) {
      report['replay2'] = this.replay2;
    }

    this.scheduleService.reportMatch(report).subscribe( res=>{
      console.log(res);
    })
  }

}
