import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';
import { TimeserviceService } from 'src/app/services/timeservice.service';

@Component({
  selector: 'app-team-results-tiles',
  templateUrl: './team-results-tiles.component.html',
  styleUrls: ['./team-results-tiles.component.css']
})
export class TeamResultsTilesComponent implements OnInit {

  currentSeason
  constructor(private scheduleService:ScheduleService, public util:UtilitiesService, public teamServ:TeamService, private timeService:TimeserviceService) {
   }


  fetching=false;
  displayArray = [];

  getTeamMatches(season,teamName){
    this.fetching = true;
    this.displayArray = [];
    this.scheduleService.getTeamSchedules(season, teamName).subscribe(
      res=>{
        this.fetching = false;
        if(res && res.length>0){
          res.forEach( match => {
            if(match.reported){
              this.displayArray.push(match);
            }
          })
        }
      },
      err=>{}
    )
  }



  @Input() headerText;

  header = this.headerText ? this.headerText : 'Season Match Results';

  showHead=true;
  @Input() set showHeader(val){
    if(val!=null||val!=undefined){
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

  teamVal;
  @Input() set team(val){
    if(val){
      this.teamVal = val;
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
      this.getTeamMatches(this.seasonVal, this.teamVal);
    }else{
      this.timeService.getSesasonInfo().subscribe(
        res => {
          let currentSeason = res['value'];
          this.getTeamMatches(currentSeason, this.teamVal);
        }
      );
    }
  }

}
