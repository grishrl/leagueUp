import { Component, OnInit, Input } from '@angular/core';
import { UtilitiesService } from '../services/utilities.service';
import { environment } from '../../environments/environment';
import { ScheduleService } from '../services/schedule.service';

@Component({
  selector: 'app-challonge-tourn',
  templateUrl: './challonge-tourn.component.html',
  styleUrls: ['./challonge-tourn.component.css']
})
export class ChallongeTournComponent implements OnInit {

  constructor(private utils:UtilitiesService, private scheduleService:ScheduleService) { }

  _team;
  _division;
  cupDiv=false;
  selectedCup
  localStoreTournaments = [];
  @Input() tournamentLink;
  @Input() theme;
  @Input() multiplier;
  @Input() matchWidthMultiplier;
  @Input() showFinalResults;
  @Input() showStandings;
  @Input() season;
  @Input() set team(val){
    if (val && !this._division){
      this._team = val;

    }
  }
  @Input() set division(val) {
    console.log(val);
    if (val && !this._team){
      console.log('a');
      this._division = val;
      if(val.cupDiv){
        this.cupDiv = true;
        console.log('b');
        // this is a cup div
        //do normal stuff
        this.scheduleService.getTournamentGames(null, this.season, this._division.divisionConcat).subscribe(res => {
          console.log(res);
          if (res.tournInfo.length > 0) {
            this.selectedCup = 0;
            this.localStoreTournaments = res.tournInfo;
            this.tournamentLink = res.tournInfo[0].challonge_url;
            this.challonge();
          }
        }, err => {
          console.log(err);
        });
      }else{
        console.log('c');
        //do normal stuff
        this.scheduleService.getTournamentGames(null, this.season, this._division.divisionConcat).subscribe(res => {
          console.log(res);
          if(res.tournInfo.length>0){
              this.tournamentLink = res.tournInfo[0].challonge_url;
              this.challonge();
          }

          // if (res['tournMatches']) {
          //   this.matches = res['tournMatches'];
          //   this.tournamentObject = this.arrangeMatches();
          // }
        }, err => {
          console.log(err);
        });
      }
    }
  }

  getTournLink(){
    if(this.selectedCup){
      this.tournamentLink = this.localStoreTournaments[this.selectedCup].challonge_url;
      this.challonge();
    }
  }

  noTournament;

  ngOnInit() {
    this.season = this.season ? this.season : environment.season;
    this.theme = this.theme ? this.theme : '1';
    this.multiplier = this.multiplier ? this.multiplier : '2.0';
    this.matchWidthMultiplier = this.matchWidthMultiplier ? this.matchWidthMultiplier : '1.5';
    this.showFinalResults = this.showFinalResults ? this.showFinalResults : '0';
    this.showStandings = this.showStandings ? this.showStandings : '1';
  if(this.tournamentLink){
    console.log('hi!');
    this.noTournament=false;
    console.log('this.tournamentLink ', this.tournamentLink);
  }else{
    //no tournament link provided
    this.noTournament=true;

  }


  }

  challonge(){
    console.log('this.tournamentLink ', this.tournamentLink);
    console.log('this.noTournament ', this.noTournament);
    if(this.tournamentLink){
 $('.tournament').challonge(this.tournamentLink, { subdomain: '', theme: this.theme, multiplier: this.multiplier, match_width_multiplier: this.matchWidthMultiplier, show_final_results: this.showFinalResults, show_standings: this.showStandings });
    }

  }

}
