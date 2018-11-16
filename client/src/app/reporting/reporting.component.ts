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

    this.scheduleService.getTeamSchedules(6, getTeam, null).subscribe(
      res => {
        this.rounds = res;
        console.log(res);
      },
      err => { console.log(err) }
    )
  }

}
