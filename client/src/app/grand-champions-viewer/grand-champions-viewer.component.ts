import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';
import { TimeserviceService } from '../services/timeservice.service';
import { forEach } from 'lodash';

@Component({
  selector: "app-grand-champions-viewer",
  templateUrl: "./grand-champions-viewer.component.html",
  styleUrls: ["./grand-champions-viewer.component.css"],
})
export class GrandChampionsViewerComponent implements OnInit {
  currentSeason = 0;
  grandFinals = {};

  constructor(
    private sched: ScheduleService,
    private timeServ: TimeserviceService
  ) {
    this.timeServ.getSesasonInfo().subscribe((res) => {
      this.currentSeason = res.value;
      for (var i = 1; i < this.currentSeason; i++) {
        this.grandFinals[i] = {};
      }
    });
  }

  sortOrder = (a, b) => {
    return a.value.sortOrder > b.value.sortOrder ? 1 : 0;
  };

  ngOnInit(): void {
    this.sched.getGrandFinals().subscribe((res) => {
      forEach(res, (v, k) => {
        this.grandFinals[k] = v;
      });
    });
  }
}
