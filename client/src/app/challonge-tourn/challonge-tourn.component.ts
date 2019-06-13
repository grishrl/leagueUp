import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-challonge-tourn',
  templateUrl: './challonge-tourn.component.html',
  styleUrls: ['./challonge-tourn.component.css']
})
export class ChallongeTournComponent implements OnInit {

  constructor() { }

  @Input() tournamentLink;
  @Input() theme;
  @Input() multiplier;
  @Input() matchWidthMultiplier;
  @Input() showFinalResults;
  @Input() showStandings;

  noTournament;

  ngOnInit() {

    this.theme = this.theme ? this.theme : '1';
    this.multiplier = this.multiplier ? this.multiplier : '2.0';
    this.matchWidthMultiplier = this.matchWidthMultiplier ? this.matchWidthMultiplier : '1.5';
    this.showFinalResults = this.showFinalResults ? this.showFinalResults : '0';
    this.showStandings = this.showStandings ? this.showStandings : '1';

  if(this.tournamentLink){
    console.log('hi!');
    $('.tournament').challonge(this.tournamentLink, { subdomain: '', theme: this.theme, multiplier: this.multiplier, match_width_multiplier: this.matchWidthMultiplier, show_final_results: this.showFinalResults, show_standings: this.showStandings});
  }else{
    //no tournament link provided
    this.noTournament=true;
    console.log('this.noTournament ',this.noTournament)
  }


  }

}
