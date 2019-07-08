import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-tournament-results-tiles',
  templateUrl: './team-tournament-results-tiles.component.html',
  styleUrls: ['./team-tournament-results-tiles.component.css']
})
export class TeamTournamentResultsTilesComponent implements OnInit {



  constructor(private scheduleService: ScheduleService, public util: UtilitiesService, public teamServ: TeamService) { }

  displayArray = [];
  getTeamMatches(teamId) {
    this.scheduleService.getTeamTournamentGames(7, teamId).subscribe(
      res => {
        if (res && res.length > 0) {

          res.forEach(match => {
            if (match.reported) {
              this.displayArray.push(match);
            }
          })
        }
      },
      err => { }
    )
  }



  @Input() headerText;

  header = this.headerText ? this.headerText : 'Tournament Match Results';

  showHead = true;
  @Input() set showHeader(val) {
    if (val != null || val != undefined) {
      this.showHead = val;
    }
  }

  reportScore(match, side) {
    let ret;
    if (match.forfeit) {
      if (match[side].score == 0) {
        ret = 'F';
      } else {
        ret = 0;
      }
    } else {
      ret = match[side].score;
    }
    return ret;
  }

  @Input() set teamId(val) {
    if (val) {
      this.getTeamMatches(val);
    }
  }

  ngOnInit() {
  }

}
