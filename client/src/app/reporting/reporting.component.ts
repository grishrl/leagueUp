import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from '../services/schedule.service';
import { AuthService } from '../services/auth.service';
import { TeamService } from '../services/team.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.css']
})
export class ReportingComponent implements OnInit {

  recTeam
  constructor(private Auth: AuthService, private teamService:TeamService, private route: ActivatedRoute, private scheduleService: ScheduleService) {
    if (this.route.snapshot.params['id']) {
      this.recTeam = this.route.snapshot.params['id'];
    }
  }
  roundsArray:any
  rounds:any
  noMatches: Boolean;
  ngOnInit() {
    let getTeam;
    if (this.recTeam) {
      getTeam = this.recTeam;
      getTeam = this.teamService.realTeamName(getTeam);
    } else {
      getTeam = this.Auth.getTeam()
    }

    
    this.scheduleService.getTeamSchedules(environment.season, getTeam).subscribe(
      res => {
        let matches = res;
        if(matches.length == 0){
          this.noMatches = true;
        }else{
          this.noMatches = false;
        }
        let roundsArray = [];
        for (var i = 0; i <= matches.length; i++) {
          if (this.rounds == null || this.rounds == undefined) {
            this.rounds = {};
          }

          let realMatchNumber = i+1;
          roundsArray.push(realMatchNumber);
          this.rounds[realMatchNumber]=[];
          matches.forEach(match => {
            if (match.round == realMatchNumber) {
              if (this.rounds[realMatchNumber] == null || this.rounds[realMatchNumber] == undefined) {
                this.rounds[realMatchNumber] = [];
              }
              this.rounds[realMatchNumber].push(match);
            }
          });

        }
        this.rounds;
        this.roundsArray = roundsArray;
        // console.log(this.roundsArray)
      },
      err => { console.log(err) }
    )
  }

}
