import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { StandingsService } from 'src/app/services/standings.service';
import { EventsService } from 'src/app/services/events.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-event-large',
  templateUrl: './event-large.component.html',
  styleUrls: ['./event-large.component.css']
})
export class EventLargeComponent implements OnInit {

  id:string;
  type:string;
  constructor(private EventService : EventsService,  private router: ActivatedRoute, private scheduleService:ScheduleService, public team:TeamService, public util:UtilitiesService, private standingsService:StandingsService, private route: Router) {
    if(this.router.snapshot.params['id']){
      this.id = this.router.snapshot.params['id'];

    }
    if (this.router.snapshot.params['type']) {
      this.type = this.router.snapshot.params['type'];

    }

  }

  match
  event

  bannerText = '';
  ngOnInit() {
    let eventType = this.type ? this.type : this.EventService.getLocalEvent()['type'];
    let eventId = this.id ? this.id : this.EventService.getLocalEvent()['id'];
    if (eventType){
      if (eventType == 'match'){
        this.bannerText = "Match Details"
        this.scheduleService.getMatchInfo(eventId).subscribe(
          res => {
            this.match = res;
            let match = res;
            let div = this.match.divisionConcat
            this.standingsService.getStandings(div).subscribe(
              res => {
                let standings = res;
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
                if (match.scheduledTime) {
                  match['friendlyDate'] = this.util.getDateFromMS(match.scheduledTime.startTime);
                  match['friendlyTime'] = this.util.getTimeFromMS(match.scheduledTime.startTime);
                  match['suffix'] = this.util.getSuffixFromMS(match.scheduledTime.startTime);
                }

              }, err => {
                console.log(err);
              });
          },
          err => {
            console.log(err);
          }
        )
      } else if (eventType == 'event'){
        this.bannerText = "Event Details"
        this.EventService.getEventById(eventId).subscribe(
          res=>{
            this.event = res;
          },
          err=>{
            console.log(err);
          }
        )
      }
    }else{
      this.route.navigate(['calendar']);
    }

  }

}
