import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { Team } from 'src/app/classes/team.class';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-matchup-info-embeddable',
  templateUrl: './matchup-info-embeddable.component.html',
  styleUrls: ['./matchup-info-embeddable.component.css']
})
export class MatchupInfoEmbeddableComponent implements OnInit {

  constructor( private scheduleService: ScheduleService, private teamService: TeamService, public team:TeamService, private flt:FilterService) { }


  @Input() teamA;
  @Input() teamB;

  teamAinf = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null); //local team profile - blank team profile
  teamBinf = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null); //local team profile - blank team profile;
  matches = [];

  teamALogo;
  teamBLogo;

  ngOnInit() {
    this.teamService.getTeam(null, null, this.teamA).subscribe(
      res => {
        this.teamAinf = res;
        this.teamALogo = this.team.imageFQDN(this.teamAinf.logo);
      }
    );
    this.teamService.getTeam(null, null, this.teamB).subscribe(
      res => {
        this.teamBinf = res;
        this.teamBLogo = this.team.imageFQDN(this.teamBinf.logo);
      }
    );
    this.scheduleService.getMatchupHistory(this.teamA, this.teamB).subscribe(
      res => {
        this.matches = this.flt.sortMatchesBySeason(res);
        this.matches = res;
        this.calculateAWins();
        this.calculateBWins();
        this.calculateAGameWins();
        this.calculateBGameWins();
      }
    );
  }

  teamAmatchWins;
  teamBmatchWins;

  teamAgameWins;
  teamBgameWins;

  calculateAWins(){
    this.teamAmatchWins = this.calculateWins(this.teamA);
  }

  calculateBWins() {
    this.teamBmatchWins = this.calculateWins(this.teamB);
  }

  calculateWins(id){
    let matchWins = 0;
    this.matches.forEach(
      match=>{
        if(match.reported){
          if (match.home.id == id && match.home.score > match.away.score) {
            matchWins += 1;
          } else if (match.away.id == id && match.away.score > match.home.score) {
            matchWins += 1;
          }
        }
      }
    );
    return matchWins;
  }

  calculateAGameWins() {
    this.teamAgameWins = this.calculateGameWins(this.teamA);
  }

  calculateBGameWins() {
    this.teamBgameWins = this.calculateGameWins(this.teamB);
  }

  calculateGameWins(id) {
    let gameWins = 0;
    this.matches.forEach(
      match => {
        if(match.reported){
          if (match.home.id == id) {
            gameWins += match.home.score;
          } else if (match.away.id) {
            gameWins += match.away.score;
          }
        }
      }
    );
    return gameWins;
  }

}
