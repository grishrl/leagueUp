import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';
import { UtilitiesService } from '../services/utilities.service';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-recent-results',
  templateUrl: './recent-results.component.html',
  styleUrls: ['./recent-results.component.css']
})
export class RecentResultsComponent implements OnInit {

  constructor(private schedule:ScheduleService, public util:UtilitiesService, public team: TeamService) { }


  display= [];

  ngOnInit() {
    this.schedule.getReportedMatches(false).subscribe(
      res=>{
        let matches = res;
        matches.forEach(match=>{
          if(this.util.returnBoolByPath(match, 'scheduledTime.startTime')){
            match.scheduledTime.startTime = parseInt(match.scheduledTime.startTime);
          }
        });
        matches = matches.sort((a,b)=>{
          if (!this.util.returnBoolByPath(a, 'scheduledTime.startTime')){
            return 1;
          } else if (!this.util.returnBoolByPath(b, 'scheduledTime.startTime')){
            return 1;
          } else if (a.scheduledTime.startTime >= b.scheduledTime.startTime){
            return -1;
          }else{
            return 1;
          }
        });
        let arrayBounds = matches.length > 3 ? 3 : matches.length;
        for (let i = 0; i < arrayBounds; i++){
          this.display.push(matches[i])
        }
        console.log(this.display);
      },
      err=>{
        console.log(err);
      }
    )
  }

}
