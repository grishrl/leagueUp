import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';
import { UtilitiesService } from '../services/utilities.service';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-diary',
  templateUrl: './diary.component.html',
  styleUrls: ['./diary.component.css']
})
export class DiaryComponent implements OnInit {

  constructor(private scheduleService: ScheduleService, public util:UtilitiesService, public team:TeamService) { }

  next4matches = [];

  ngOnInit() {
    this.scheduleService.getNearestMatches(4).subscribe(
      res=>{
        res.forEach( (match, ind)=>{
          if(ind<4){
            match.home.logo = this.team.imageFQDN(match.home.logo);
            match.away.logo = this.team.imageFQDN(match.away.logo);
            this.next4matches.push(match);
          }
        });
      },
      err=>{
        console.warn(err);
      }
    )
  }

}
