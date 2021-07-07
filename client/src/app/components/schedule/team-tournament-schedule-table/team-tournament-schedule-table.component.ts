import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { StandingsService } from 'src/app/services/standings.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { TimeService } from 'src/app/services/time.service';

@Component({
  selector: "app-team-tournament-schedule-table",
  templateUrl: "./team-tournament-schedule-table.component.html",
  styleUrls: ["./team-tournament-schedule-table.component.css"],
})
export class TeamTournamentScheduleTableComponent implements OnInit {
  constructor(
    public teamServ: TeamService,
    private scheduleService: ScheduleService,
    public util: UtilitiesService,
    private standingsService: StandingsService,
    private Auth: AuthService,
    private router: Router,
    private timeService: TimeService,
  ) {}

  noMatches;
  rounds;
  roundsArray;
  matches = [];
  historical = false;
  activeTourns = [];

  initHistoricalSchedule(providedSeason,teamId) {
    this.historical = true;
    this.scheduleService
      .getTeamTournamentGames(providedSeason, teamId)
      .subscribe(
        (res) => {

          let matches = res;
          //set the nomatches state
          if (matches.length == 0) {
            this.noMatches = true;
          } else {
            this.noMatches = false;
          }

          matches.forEach((match) => {
            if (match.scheduleDeadline) {
              match["friendlyDeadline"] = this.util.getDateFromMS(
                match.scheduleDeadline
              );
            }

            if (match.scheduledTime) {
              match["friendlyDate"] = this.util.getDateFromMS(
                match.scheduledTime.startTime
              );
              match["friendlyTime"] = this.util.getTimeFromMS(
                match.scheduledTime.startTime
              );
              match["suffix"] = this.util.getSuffixFromMS(
                match.scheduledTime.startTime
              );
            }

            if (
              !this.util.returnBoolByPath(match, "home") &&
              !this.util.returnBoolByPath(match, "home.name")
            ) {
              match.home = {
                teamName: "TBD",
              };
            }
            if (
              !this.util.returnBoolByPath(match, "away") &&
              !this.util.returnBoolByPath(match, "away.name")
            ) {
              match.away = {
                teamName: "TBD",
              };
            }
          });

          this.matches = matches;
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  teamObj;
  @Input() set team(val) {
    if (val) {
      this.teamObj = val;
    }
  }

  seasonVal;
  @Input() set season(val) {
    if (val) {
      this.seasonVal = val;
    }
  }

  userCanSchedule() {
    if (
      this.teamObj.teamName == this.Auth.getTeam() &&
      this.Auth.getCaptain() != "false"
    ) {
      return true;
    } else {
      return false;
    }
  }

  getActiveTournaments() {
    this.teamServ.getActiveTournaments(this.teamObj._id).subscribe(
      (res) => {
        this.activeTourns = res;
      },
      (err) => {
        console.warn(err);
      }
    );
  }


  closedTourns = [];

  todayDate;
  ngOnInit() {
    this.todayDate = new Date().getTime();
    this.timeService.getSesasonInfo().subscribe(
        (res) => {
          let currentSeason = res["value"];
          this.teamServ.getSeasonTournaments(this.teamObj._id, currentSeason).subscribe(
            res=>{
                res.forEach(tourn=>{
                  if(tourn.active){
                    this.activeTourns.push(tourn);
                  }else{
                    this.closedTourns.push(tourn);
                  }
                });
            }
          );
          // this.getActiveTournaments();
          // this.initHistoricalSchedule(currentSeason, this.teamObj._id);
        },
        (err) => {
          console.warn(err);
        }
      );
    // if (this.seasonVal) {
    //   this.initHistoricalSchedule(this.teamObj._id, this.seasonVal);
    // } else {
    //   this.timeService.getSesasonInfo().subscribe(
    //     (res) => {
    //       let currentSeason = res["value"];
    //       this.getActiveTournaments();
    //       this.initHistoricalSchedule(currentSeason, this.teamObj._id);
    //     },
    //     (err) => {}
    //   );
    // }
  }
}
