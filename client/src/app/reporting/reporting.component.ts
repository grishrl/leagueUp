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
        for (var i = 1; i <= matches.length; i++) {
          if (this.rounds == null || this.rounds == undefined) {
            this.rounds = {};
          }
          matches.forEach(match => {
            if (match.round == i) {
              if (this.rounds[i.toString()] == null || this.rounds[i.toString()] == undefined) {
                this.rounds[i.toString()] = [];
              }
              this.rounds[i.toString()].push(match);
            }
          });

        }
        this.rounds;
      },
      err => { console.log(err) }
    )
  }

}
