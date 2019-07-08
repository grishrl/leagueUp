import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';
import { StandingsService } from 'src/app/services/standings.service';
import { environment } from '../../../environments/environment';
import { TimeserviceService } from 'src/app/services/timeservice.service';

@Component({
  selector: 'app-team-schedule',
  templateUrl: './team-schedule.component.html',
  styleUrls: ['./team-schedule.component.css']
})
export class TeamScheduleComponent implements OnInit {

  //component properties
  recTeam  //holds id received in the url route
  noMatches: boolean; // set to true if there are no matches returned or false if there are, used for displaying certain messages
  rounds: any //local variable to parse received team matches into
  roundsArray:any
  index = 0;
  currentSeason;

  constructor(private Auth: AuthService, private route: ActivatedRoute, private router: Router,
    private scheduleService:ScheduleService, public util:UtilitiesService, public team: TeamService,
    private standingsService:StandingsService, private timeService:TimeserviceService) {
    //get the ID from the route
    if (this.route.snapshot.params['id']) {
      this.recTeam = this.route.snapshot.params['id'];
    }
    this.timeService.getSesasonInfo().subscribe(res => {
      this.currentSeason = res['value'];
      this.ngOnInit();
    });
   }

  showDeadlineText(match){
    let ret = true;
    if (match.scheduledTime && match.scheduledTime.startTime){
      ret = false;
    }
    return ret;
  }


  scheduleMatch(id){
    this.router.navigate(['schedule/scheduleMatch', id]);
  }

  todayDate

  checkDate(match){
    let ret = false;
    if (match['scheduleDeadline']){
      let intDate = parseInt(match['scheduleDeadline']);
      let weekAgo = intDate - 604800000;
      if (this.todayDate > weekAgo){
        ret = true;
      }
    }
    return ret;
  }

  ngOnInit() {
    this.todayDate = new Date().getTime();
    //get the team from the route, if it that is not present get it from the auth service
    let getTeam;
    if(this.recTeam){
      getTeam = this.recTeam;
    }else{
      getTeam = this.Auth.getTeam();
      this.recTeam = getTeam;
    }
    if(this.currentSeason && getTeam){
      this.scheduleService.getTeamSchedules(this.currentSeason, getTeam).subscribe(
        res => {
          let matches = res;
          //set the nomatches state
          if (matches.length == 0) {
            this.noMatches = true;
          } else {
            this.noMatches = false;
          }
          let div = matches[0].divisionConcat
          this.standingsService.getStandings(div).subscribe(
            res => {
              let standings = res;
              matches.forEach(match => {
                standings.forEach(standing => {
                  if (match.home.teamName == standing.teamName) {
                    match.home['losses'] = standing.losses;
                    match.home['wins'] = standing.wins;
                  }
                  if (match.away.teamName == standing.teamName) {
                    match.away['losses'] = standing.losses;
                    match.away['wins'] = standing.wins;
                  }
                });
                if (match.scheduleDeadline) {
                  match['friendlyDeadline'] = this.util.getDateFromMS(match.scheduleDeadline);
                }

                if (match.scheduledTime) {
                  match['friendlyDate'] = this.util.getDateFromMS(match.scheduledTime.startTime);
                  match['friendlyTime'] = this.util.getTimeFromMS(match.scheduledTime.startTime);
                  match['suffix'] = this.util.getSuffixFromMS(match.scheduledTime.startTime);
                }
              })
            }, err => {
              console.log(err);
            });

          //build out the rounds object:
          /*
          rounds = {
            'roundNubmer':[
                            {matchObject},
                            {matchObject}
                          ]
                        }
          */
          let roundsArray = [];
          if (matches.length % 2 == 0) {
            for (var i = 0; i <= matches.length; i++) {
              if (this.rounds == null || this.rounds == undefined) {
                this.rounds = {};
              }

              let realRoundNumber = i + 1;
              roundsArray.push(realRoundNumber);
              matches.forEach(match => {
                if (this.rounds[realRoundNumber] == null || this.rounds[realRoundNumber] == undefined) {
                  this.rounds[realRoundNumber] = [];
                }
                if (match.round == realRoundNumber) {
                  // roundsArray.push(realRoundNumber);
                  this.rounds[realRoundNumber].push(match);
                }

              });
            }
          } else if (matches.length % 2 != 0) {
            for (var i = 0; i < matches.length; i++) {
              if (this.rounds == null || this.rounds == undefined) {
                this.rounds = {};
              }
              let realRoundNumber = i + 1;
              roundsArray.push(realRoundNumber);
              matches.forEach(match => {
                if (this.rounds[realRoundNumber] == null || this.rounds[realRoundNumber] == undefined) {
                  this.rounds[realRoundNumber] = [];
                }
                if (match.round == realRoundNumber) {
                  this.rounds[realRoundNumber].push(match);
                }

              });
            }
          }



          this.rounds;
          this.roundsArray = roundsArray;
        },
        err => { console.log(err) }
      )
    }

  }

  //returns true if there is a scheduled time, and displays the scheduled time
  //returns false if there is not a scheduled time and displays the link to scheduling component
  showSchedule(match){
      if (this.util.returnBoolByPath(match, 'scheduledTime.priorScheduled')) {
        return true;
      } else {
        return false;
      }
  }


  //hides rows if the team has a bye week, no need for scheduling
  byeWeekHide(match){
    //if this is a bye week don't show
    if (!this.util.returnBoolByPath(match, 'away.teamName') || !this.util.returnBoolByPath(match, 'home.teamName')) {
      return true;
    } else {
      return false;
    }
  }

  userCanSchedule(){
    if(this.recTeam == this.Auth.getTeam() && this.Auth.getCaptain() != 'false'){
      return true;
    }else{
      return false;
    }
  }

  //TODO: seen this code or similiar a few times, can we refactor?
  displayTime(ms){
    let d = new Date(parseInt(ms));
    let day = d.getDate();
    let year = d.getFullYear();
    let month = d.getMonth();
    month=month+1;
    let hours = d.getHours();
    let suffix = "AM";
    if(hours>12){
      hours = hours-12;
      suffix = "PM";
    }
    let min = d.getMinutes();
    let minStr;
    if(min == 0){
      minStr = '00';
    }else{
      minStr = min.toString();
    }
    let dateTime = month+'/'+day+'/'+year+' @ '+hours+':'+minStr+" "+suffix;
    return dateTime;
  }


}
