import { Component, OnInit, ViewChild } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { FilterService } from 'src/app/services/filter.service';
import { TimeService } from 'src/app/services/time.service';
import * as moment from 'moment-timezone';

@Component({
  selector: "app-live-casts",
  templateUrl: "./live-casts.component.html",
  styleUrls: ["./live-casts.component.css"],
})
export class LiveCastsComponent implements OnInit {

  currentSeason;
  constructor(
    public team: TeamService,
    private scheduleService: ScheduleService,
    public util: UtilitiesService,
    private filterService: FilterService,
    private timeService: TimeService
  ) {
    this.timeService.getSesasonInfo().subscribe((res) => {
      this.currentSeason = res.value;
      this.initSchedule();
    });
  }

  filterMatches: any;

  friendlyDate;

  loading = false;

  ngAfterViewInit() {

  }

  ngOnInit() {
    let zeroHour = moment();

    zeroHour.hours(0);
    zeroHour.minutes(0);
    zeroHour.milliseconds(0);

    this.friendlyDate = zeroHour.unix() * 1000;

  }

  initSchedule() {
    this.loading = true;
    this.scheduleService
      .getScheduleMatches(this.currentSeason, null, null)
      .subscribe((sched) => {
        this.loading = false;
        this.filterMatches = sched;
        this.filterMatches.forEach((match) => {
          match.submitCaster = {
            name: "",
            URL: "",
          };

        });
      });
  }


}
