import { Component, OnInit, Input } from '@angular/core';
import { UtilitiesService } from '../../services/utilities.service';
import { environment } from '../../../environments/environment';
import { ScheduleService } from '../../services/schedule.service';
import { TimeserviceService } from '../../services/timeservice.service';

@Component({
  selector: 'app-challonge-tourn',
  templateUrl: './challonge-tourn.component.html',
  styleUrls: ['./challonge-tourn.component.css']
})
export class ChallongeTournComponent implements OnInit {

  constructor(private utils:UtilitiesService, private scheduleService:ScheduleService, private timeService:TimeserviceService) {
    this.timeService.getSesasonInfo().subscribe(
      res=>{
        this.currentSeason = res['value'];
      }
    );
   }

   currentSeason;

  noTourn=false;
  _team;
  _division;
  cupDiv=false;
  selectedCup
  localStoreTournaments = [];
  _tournamentLink
  @Input() set tournamentLink(val){
    if(val){
      this._tournamentLink = val;
      this.challonge();
    }
  };
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

    if (val && !this._team){

      this._division = val;
      if(val.cupDiv){
        this.cupDiv = true;

        this.scheduleService.getTournamentGames(null, this.season, this._division.divisionConcat).subscribe(res => {

          if (res.tournInfo.length > 0) {
            this.noTourn = false;
            this.selectedCup = 0;
            this.localStoreTournaments = res.tournInfo;
            this._tournamentLink = res.tournInfo[0].challonge_url;
            this.challonge();
          }else{
            this.noTourn = true;
          }
        }, err => {
          console.warn(err);
        });
      }else{
        this.cupDiv = false;
        //do normal stuff
        this.scheduleService.getTournamentGames(null, this.season, this._division.divisionConcat).subscribe(res => {
          if(res.tournInfo.length>0){
            this.noTourn = false;
              this._tournamentLink = res.tournInfo[0].challonge_url;
              this.challonge();
          }else{
            this.noTourn = true;
          }
        }, err => {
          console.warn(err);
        });
      }
    }
  }

  getTournLink(){
    if(this.selectedCup){
      this._tournamentLink = this.localStoreTournaments[this.selectedCup].challonge_url;
      this.challonge();
    }
  }

  noTournament;

  ngOnInit() {
    this.season = this.season ? this.season : this.currentSeason;
    this.theme = this.theme ? this.theme : '1';
    this.multiplier = this.multiplier ? this.multiplier : '2.0';
    this.matchWidthMultiplier = this.matchWidthMultiplier ? this.matchWidthMultiplier : '1.5';
    this.showFinalResults = this.showFinalResults ? this.showFinalResults : '0';
    this.showStandings = this.showStandings ? this.showStandings : '1';
  if(this._tournamentLink){
    this.noTournament=false;
    this.challonge();
  }else{
    //no tournament link provided
    this.noTournament=true;

  }


  }

  challonge(){
    if(this._tournamentLink){
 $('.tournament').challonge(this._tournamentLink, { subdomain: '', theme: this.theme, multiplier: this.multiplier, match_width_multiplier: this.matchWidthMultiplier, show_final_results: this.showFinalResults, show_standings: this.showStandings });
    }

  }

}
