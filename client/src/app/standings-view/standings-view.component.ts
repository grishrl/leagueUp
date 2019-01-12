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

  getStandings(div){
    this.standingsService.getStandings(div).subscribe(
      (res) => {
        this.standings = res;
      },
      (err) => {
        console.log(err);
      }
    )
  }

  ngOnInit() {

  }

}
