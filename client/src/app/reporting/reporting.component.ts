import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from '../services/schedule.service';
import { AuthService } from '../services/auth.service';
import { TeamService } from '../services/team.service';

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

    
    this.scheduleService.getTeamSchedules(6, getTeam).subscribe(
      res => {
        let matches = res;
        if(matches.length == 0){
          this.noMatches = true;
        }else{
          this.noMatches = false;
        }
        for (var i = 0; i <= matches.length; i++) {
          if (this.rounds == null || this.rounds == undefined) {
            this.rounds = {};
          }
          
          let realMatchNumber = i+1;
          this.rounds[realMatchNumber.toString()]=[];
          matches.forEach(match => {
            if (match.round == realMatchNumber) {
              if (this.rounds[realMatchNumber.toString()] == null || this.rounds[realMatchNumber.toString()] == undefined) {
                this.rounds[realMatchNumber.toString()] = [];
              }
              this.rounds[realMatchNumber.toString()].push(match);
            }
          });

        }
        this.rounds;
      },
      err => { console.log(err) }
    )
  }

}
