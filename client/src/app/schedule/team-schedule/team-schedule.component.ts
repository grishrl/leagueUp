import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { ActivatedRoute } from '@angular/router';
import { UtilitiesService } from 'src/app/services/utilities.service';

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
  
  constructor(private Auth: AuthService, private route: ActivatedRoute, private scheduleService:ScheduleService, private util:UtilitiesService) {
    //get the ID from the route
    if (this.route.snapshot.params['id']) {
      this.recTeam = this.route.snapshot.params['id'];
    }
   }


  ngOnInit() {
    //get the team from the route, if it that is not present get it from the auth service
    let getTeam;
    if(this.recTeam){
      getTeam = this.recTeam;
    }else{
      getTeam = this.Auth.getTeam();
    }
    
    //TODO: remove hard coded season 6!!!
    this.scheduleService.getTeamSchedules(6, getTeam).subscribe(
      res=>{
        let matches = res;
        //set the nomatches state
        if (matches.length == 0 ){
          this.noMatches = true;
        }else{
          this.noMatches = false;
        }

        //build out the rounds object:
        /*
        rounds = { 
          'roundNubmer':[
                          {matchObject},
                          {matchObject}
                        ] 
                      }
        */
        for(var i = 1; i<=matches.length; i++){
          if(this.rounds == null || this.rounds == undefined){
            this.rounds = {};
          }
          matches.forEach(match => {
            if(match.round == i){
              if (this.rounds[i.toString()] == null || this.rounds[i.toString()] == undefined){
                this.rounds[i.toString()] = [];
              }
              this.rounds[i.toString()].push(match);
            }
          });
        }
        this.rounds;
      },
      err=>{console.log(err)}
    )
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
