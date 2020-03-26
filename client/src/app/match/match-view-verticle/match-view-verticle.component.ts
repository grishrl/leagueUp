import { Component, OnInit, Input } from '@angular/core';
import { UtilitiesService } from '../../services/utilities.service';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-match-view-verticle',
  templateUrl: './match-view-verticle.component.html',
  styleUrls: ['./match-view-verticle.component.css']
})
export class MatchViewVerticleComponent implements OnInit {

  constructor(public team: TeamService, public util: UtilitiesService) { }

  showReplay = false;
  match = {
    home: {
      teamName: '',
      logo: '',
      wins: null,
      losses: null,
      score:null,
      dominator: null
    },
    away: {
      teamName: '',
      logo: '',
      wins: null,
      losses: null,
      score: null,
      dominator:null
    },
    mapBans:{
      homeOne: null,
      homeTwo: null,
      awayOne: null,
      awayTwo: null
    },
    scheduledTime: {
      startTime: null,
      endTime: null
    },
    vodLinks:[],
    casterName: '',
    casterUrl: '',
    replays:null
  }
  homeLogo;
  awayLogo;
  @Input() set passMatch(_match) {
    if (_match != undefined && _match != null) {
      this.match = _match;
      if (this.util.returnBoolByPath(this.match, 'scheduledTime.startTime')) {
        this.match.scheduledTime.startTime = parseInt(this.match.scheduledTime.startTime);
      }
      if (this.util.returnBoolByPath(this.match, 'replays._id')) {
        delete this.match.replays._id;
      }
      this.homeLogo = this.team.imageFQDN(this.match.home.logo);
      this.awayLogo = this.team.imageFQDN(this.match.away.logo);
    }
  }

  testScore(score){
    let ret = false;
    if(!this.util.isNullOrEmpty(score)){
       ret = true;
    }else if(!isNaN(score)){
      ret = true;
    }
    return ret;
  }

  winningClass(position, match){
    if(
      match.home.score > match.away.score && position == 'home'
    ){
      return 'winning';
    }else if(
      match.away.score > match.home.score && position == 'away'
    ){
      return 'winning';
    }
  }

  ngOnInit() {
  }

}
