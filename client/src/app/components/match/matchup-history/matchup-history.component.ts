import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-matchup-history',
  templateUrl: './matchup-history.component.html',
  styleUrls: ['./matchup-history.component.css']
})
export class MatchupHistoryComponent implements OnInit {

  constructor(private aR: ActivatedRoute) { }

  teamA;
  teamB;

  ngOnInit() {

    this.aR.paramMap.subscribe(
      params=>{
        this.teamA = params['params'].teamAid;
        this.teamB = params['params'].teamBid;
      }
    )
  }

}
