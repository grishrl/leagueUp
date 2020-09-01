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
  lastSeason;
  selectedSeason;
  seasonArray = [];
  matches;
  constructor(
    private sched: ScheduleService,
    private timeServ: TimeserviceService
  ) {
    this.timeServ.getSesasonInfo().subscribe((res) => {
      this.currentSeason = res.value;
      this.lastSeason = this.currentSeason-1;
      this.selectedSeason = this.lastSeason;
      for (var i = 1; i < this.currentSeason; i++) {
        this.seasonArray.push(i);
        this.grandFinals[i] = {};
      }
    });
  }

  sortOrder = (a, b) => {
    return a.value.sortOrder > b.value.sortOrder ? 1 : 0;
  };

  next(){
    if(this.selectedSeason<this.lastSeason){
      this.selectedSeason++;
      this.createMatches();
    }
  }

  previous(){
        if (this.selectedSeason > 1) {
          this.selectedSeason--;
          this.createMatches();
        }
  }

  createMatches(){
    this.matches = this.grandFinals[this.selectedSeason];
  }

  ngOnInit(): void {
    this.sched.getGrandFinals().subscribe((res) => {
      forEach(res, (v, k) => {
        this.grandFinals[k] = v;
      });
    });
  }
}
