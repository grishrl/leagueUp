import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { StandingsService } from 'src/app/services/standings.service';
import { EventsService } from 'src/app/services/events.service';
import { environment } from '../../../../environments/environment';
import { DivisionService } from 'src/app/services/division.service';

@Component({
  selector: 'app-event-large',
  templateUrl: './event-large.component.html',
  styleUrls: ['./event-large.component.css']
})
export class EventLargeComponent implements OnInit {

  id: string;
  type: string;
  constructor(private EventService: EventsService, private router: ActivatedRoute, private scheduleService: ScheduleService, public team: TeamService, public util: UtilitiesService, private standingsService: StandingsService, private route: Router,
    private divisionService: DivisionService) {
    if (this.router.snapshot.params['id']) {
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
    if (eventType) {
      if (eventType == 'match') {
        this.bannerText = "Match Details"
        this.scheduleService.getMatchInfo(eventId).subscribe(
          res => {
            this.match = res;
            let match = res;
            let div = this.match.divisionConcat
            if (this.util.returnByPath(this.match, 'type') == 'grandfinal') {

              this.divisionService
                .getDivisionTeam(this.match.home.teamName)
                .subscribe((res) => {

                  this.parseStandings(res.divisionConcat);

                });
              this.divisionService
                .getDivisionTeam(this.match.away.teamName)
                .subscribe((res) => {
                  this.parseStandings(res.divisionConcat);
                });


            } else {
              this.parseStandings(div);
            }

            if (this.match.scheduledTime) {
              this.match[
                "friendlyDate"
              ] = this.util.getDateFromMS(
                this.match.scheduledTime
                  .startTime
              );
              this.match[
                "friendlyTime"
              ] = this.util.getTimeFromMS(
                this.match.scheduledTime
                  .startTime
              );
              this.match[
                "suffix"
              ] = this.util.getSuffixFromMS(
                this.match.scheduledTime
                  .startTime
              );
            }

          },
          err => {
            console.warn(err);
          }
        )
      } else if (eventType == 'event') {
        this.bannerText = "Event Details"
        this.EventService.getEventById(eventId).subscribe(
          res => {
            this.event = res;
          },
          err => {
            console.warn(err);
          }
        )
      }
    } else {
      this.route.navigate(['calendar']);
    }

  }

  private parseStandings(div) {
    this.standingsService.getStandings(div).subscribe(
      (res) => {
        let standings = res;
        standings.forEach((standing) => {
          if (
            this.match.home.teamName == standing.teamName
          ) {
            this.match.home["losses"] =
              standing.losses;
            this.match.home["wins"] = standing.wins;
          }
          if (
            this.match.away.teamName ==
            standing.teamName
          ) {
            this.match.away["losses"] =
              standing.losses;
            this.match.away["wins"] = standing.wins;
          }
        });
      },
      (err) => {
        console.warn(err);
      }
    );
  }

}
