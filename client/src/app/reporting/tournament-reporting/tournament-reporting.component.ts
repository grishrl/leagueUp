import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-tournament-reporting',
  templateUrl: './tournament-reporting.component.html',
  styleUrls: ['./tournament-reporting.component.css']
})
export class TournamentReportingComponent implements OnInit {

  constructor(private auth: AuthService, private team: TeamService) { }

  selectedTournament = {
    'season':undefined,
    'name': undefined,
    'division': undefined
  };

  involvedTournaments = [];
  matches = [];
  _team;

  ngOnInit() {
    this._team = this.auth.getTeam();
    this.team.getTournaments(this.auth.getTeamId()).subscribe(res => {
      this.involvedTournaments = res;
    }, err => {
      console.log('y ', err);
    })

  }

  selected() {
    this.getTeamTournamentMatches(this.selectedTournament);
  }

  getTeamTournamentMatches(tournament) {
    this.team.getTournamentMatches(this.auth.getTeamId(), tournament.name, tournament.season, tournament.division).subscribe(
      res => {
        this.matches = res;
      },
      err => {
        console.log(err);
      }
    )
  }
}
