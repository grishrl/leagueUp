import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';
import { TimeserviceService } from 'src/app/services/timeservice.service';


@Component({
  selector: 'app-team-tournament-results-tiles',
  templateUrl: './team-tournament-results-tiles.component.html',
  styleUrls: ['./team-tournament-results-tiles.component.css']
})
export class TeamTournamentResultsTilesComponent implements OnInit {



  constructor(private scheduleService: ScheduleService, public util: UtilitiesService, public teamServ: TeamService, private timeService:TimeserviceService) { }

  displayArray = [];

  getTeamMatches(season, teamId) {
    this.scheduleService.getTeamTournamentGames(season, teamId).subscribe(
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

  header;

  @Input() set headerText(val){
    if(val){
      this.header = 'Tournament Match Results'
    }else{
      this.header = val;
    }
  }

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

  teamIdVal;
  @Input() set teamId(val) {
    if (val) {
      this.teamIdVal = val;
    }
  }

  seasonVal
  @Input() set season(val) {
    if (val) {
     this.seasonVal = val;
    }
  }

  ngOnInit() {
    if(this.seasonVal){
      this.getTeamMatches(this.seasonVal, this.teamIdVal);
    }else{
      this.timeService.getSesasonInfo().subscribe(
        res => {
          let currentSeason = res['value'];
          this.getTeamMatches(currentSeason, this.teamIdVal);
        });
    }
  }

}
