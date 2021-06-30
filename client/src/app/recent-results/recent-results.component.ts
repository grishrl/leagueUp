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
    this.schedule.getReportedMatches('des', 10, false).subscribe(
      res=>{
        let matches = res;

        let arrayBounds = matches.length > 3 ? 3 : matches.length;
        for (let i = 0; i < arrayBounds; i++){
          this.display.push(matches[i])
        }
      },
      err=>{
        console.warn(err);
      }
    )
  }

}
