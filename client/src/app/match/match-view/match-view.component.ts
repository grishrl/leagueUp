import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from '../../services/utilities.service';
import { AuthService } from 'src/app/services/auth.service';
import { DivisionService } from 'src/app/services/division.service';

@Component({
  selector: 'app-match-view',
  templateUrl: './match-view.component.html',
  styleUrls: ['./match-view.component.css']
})
export class MatchViewComponent implements OnInit {

  divisionDisplayName;
  match = {
    matchId:'',
    divisionConcat:'',
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
    type:'',
    casterName:'',
    casterUrl:''
  }
  @Input() set passMatch(_match){
    if(_match != undefined && _match != null){
      this.match = _match;
      if (this.util.returnBoolByPath(this.match, 'scheduledTime.startTime')){
        this.match.scheduledTime.startTime = parseInt(this.match.scheduledTime.startTime);
      }
      if(this.match.type && this.match.type=='tournament'){
        if(!this.util.returnBoolByPath(this.match, 'home')){
          this.match.home = {
            teamName: '',
            logo: '',
            wins: null,
            losses: null
          };
          this.match.home.teamName = 'TBD';
          this.match.home.logo = null;
        }
        if (!this.util.returnBoolByPath(this.match, 'away')) {
          this.match.away = {
            teamName: '',
            logo: '',
            wins: null,
            losses: null
          };
          this.match.away.teamName = 'TBD';
          this.match.away.logo = null;
        }
      }
      this.divisionService.getDivision(this.match.divisionConcat).subscribe(
        res=>{
          this.divisionDisplayName=res.displayName;
        }
      )
    }
  }

  constructor(public team: TeamService, public util: UtilitiesService, public Auth:AuthService, private divisionService:DivisionService) { }

  ngOnInit() {
  }

}
