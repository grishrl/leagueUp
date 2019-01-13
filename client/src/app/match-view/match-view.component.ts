import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from '../services/utilities.service';

@Component({
  selector: 'app-match-view',
  templateUrl: './match-view.component.html',
  styleUrls: ['./match-view.component.css']
})
export class MatchViewComponent implements OnInit {

  match = {
    home:{
      teamName:'',
      logo:'',
      wins:null,
      losses:null
    },
    away: {
      teamName: '',
      logo: '',
      wins: null,
      losses: null
    },
    scheduledTime:{
      startTime:null,
      endTime:null
    },
    casterName:'',
    casterUrl:''
  }
  @Input() set passMatch(_match){
    if(_match != undefined && _match != null){
      this.match = _match;
    }
  }

  constructor(public team: TeamService, public util: UtilitiesService) { }

  ngOnInit() {
  }

}
