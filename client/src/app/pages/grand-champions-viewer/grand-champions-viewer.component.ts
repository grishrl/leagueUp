import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../../services/schedule.service';
import { TimeserviceService } from '../../services/timeservice.service';
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
  doneLoading=false;
  constructor(
    private sched: ScheduleService,
    private timeServ: TimeserviceService
  ) {
    this.timeServ.getSesasonInfo().subscribe((res) => {
      this.currentSeason = res.value;
      this.lastSeason = this.currentSeason - 1;
      this.selectedSeason = this.lastSeason;
      for (var i = 1; i < this.currentSeason; i++) {
        this.seasonArray.push(i);
        this.grandFinals[i] = {};
      }
    });
        this.sched.getGrandFinals().subscribe((res) => {
          forEach(res, (v, k) => {
            this.grandFinals[k] = v;
          });
          this.doneLoading = true;
          this.createMatches();
        });
  }

  sortOrder = (a, b) => {
    return a.value.sortOrder > b.value.sortOrder ? 1 : 0;
  };

  next() {
    if (this.selectedSeason < this.lastSeason) {
      this.selectedSeason++;
      this.createMatches();
    }
  }

  divisionSortValues = [
    {
      name: "storm",
      val: 1
    },
    {
      name: "heroic",
      val: 2
    },
    {
      name: "division a",
      val: 3
    },
    {
      name: "division b",
      val: 4
    },
    {
      name: "division c",
      val: 5
    },
    {
      name: "division d",
      val: 6
    },
    {
      name: "division e",
      val: 7
    }
  ];

  returnDivisionSortValue(name){
    let ret = -1;
    let test = name.toLowerCase();
    this.divisionSortValues.forEach(v=>{
      if( test.includes(v.name) ){
        ret = v.val;
      }
    });
    return ret;
  }

  sortMatchesCorrectly(matches) {
    return matches.sort( (a,b)=>{
      if(this.returnDivisionSortValue(a.title) < this.returnDivisionSortValue(b.title)){
        return -1;
      }else{
        return 1;
      }
    })
  }

  previous() {
    if (this.selectedSeason > 1) {
      this.selectedSeason--;
      this.createMatches();
    }
  }

  createMatches() {
    this.matches = this.grandFinals[this.selectedSeason];
  }

  ngOnInit(): void {

  }
}
