import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { StandingsService } from '../../../services/standings.service';
import { TeamService } from '../../../services/team.service';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'app-standings-view',
  templateUrl: './standings-view.component.html',
  styleUrls: ['./standings-view.component.css']
})
export class StandingsViewComponent implements OnInit, OnChanges {

  constructor(public team: TeamService,private standingsService:StandingsService, private Utl:UtilitiesService) { }

  div:any;
  standings:any[]=[];

  @Input() set division(div){
    if(div!=null&&div!=undefined){
      this.div = div;
    }
  }

  seasonVal;
  @Input() set season(season){
    if(season){
      this.seasonVal=season;
    }
  }

  ngOnChanges(changes:SimpleChanges){
    if(changes.season && changes.season.currentValue){
      this.whatToRun();
    } else if(changes.division && changes.division.currentValue){
      this.whatToRun();
    }
  }

  private whatToRun(){

    if(this.seasonVal && this.div.displayName){
      this.pastStandingsIntialise();
    }else if(this.div.displayName){
      this.getStandings(this.div.divisionConcat);
    }
  }

  pastStandingsIntialise(){
      //do something
    if (this.Utl.isNullOrEmpty(this.div.divisionConcat) == false && this.Utl.isNullOrEmpty(this.seasonVal)==false){
      this.standingsService.getPastStandings(this.div.divisionConcat, this.seasonVal).subscribe(
        (res) => {
          if (this.div.cupDiv) {
            let tO = {};
            // let allTeams = this.div.teams.concat(this.div.participants);
            // allTeams
          } else {
            let results = res ? res : [];
            this.standings = results;
          }
        },
        (err) => {
          console.warn(err);
        }
      )
    }
  }

  getStandings(div){
    this.standings = [];
    if(this.Utl.isNullOrEmpty(div)==false){
      this.standingsService.getStandings(div).subscribe(
        (res) => {
          if (this.div.cupDiv) {
            let tO = {};
            // let allTeams = this.div.teams.concat(this.div.participants);
            // allTeams
          } else {
            let results = res ? res : [];
            this.standings = results;
          }
        },
        (err) => {
          console.warn(err);
        }
      )
    }

  }

  ngOnInit() {

  }

}
