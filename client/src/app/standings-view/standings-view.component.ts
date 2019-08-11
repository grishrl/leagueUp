import { Component, OnInit, Input } from '@angular/core';
import { StandingsService } from '../services/standings.service';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-standings-view',
  templateUrl: './standings-view.component.html',
  styleUrls: ['./standings-view.component.css']
})
export class StandingsViewComponent implements OnInit {

  constructor(public team: TeamService,private standingsService:StandingsService) { }

  div:any;
  standings:any[]=[];

  @Input() set division(div){
    if(div!=null&&div!=undefined){
      this.div = div;
      this.ngOnInit();
    }
  }

  seasonVal;
  @Input() set season(season){
    if(season){
      this.seasonVal=season;
      // this.pastStandingsIntialise();
    }
  }

  pastStandingsIntialise(){

      //do something
      this.standingsService.getPastStandings(this.div.divisionConcat, this.seasonVal).subscribe(
        (res) => {
          if (this.div.cupDiv) {
            let tO = {};
            // let allTeams = this.div.teams.concat(this.div.participants);
            // allTeams
          } else {
            console.log(res);
            this.standings = res;
          }
        },
        (err) => {
          console.log(err);
        }
      )

  }

  getStandings(div){
    this.standings = [];
    this.standingsService.getStandings(div).subscribe(
      (res) => {
        if(this.div.cupDiv){
          let tO = {};
          // let allTeams = this.div.teams.concat(this.div.participants);
          // allTeams
        }else{
          console.log(res);
          this.standings = res;
        }
      },
      (err) => {
        console.log(err);
      }
    )
  }

  ngOnInit() {
    if(this.seasonVal){
      this.pastStandingsIntialise();
    }else{
      this.getStandings(this.div.divisionConcat);
    }

  }

}
