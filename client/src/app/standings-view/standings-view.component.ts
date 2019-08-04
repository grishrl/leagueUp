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
      this.getStandings(div.divisionConcat);

    }
  }

  customSeason;
  @Input() set season(season){
    console.log('season xx', season);
    if(season){
      this.customSeason=season;
      this.pastStandingsIntialise();
    }
  }

  previousDivision;
  @Input() set pastDivision(division) {
    if(division){
      console.log('division ', division)
      this.div = division;
      this.previousDivision = division.divisionConcat;
      this.pastStandingsIntialise();
    }


  }

  pastStandingsIntialise(){
    console.log(this.customSeason , this.previousDivision)
    if(this.customSeason && this.previousDivision){
      //do something
      this.standingsService.getPastStandings(this.previousDivision, this.customSeason).subscribe(
        (res) => {
          console.log('zzzzz ' ,res)
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

  }

}
