import { Component, OnInit } from '@angular/core';
import { MvpService } from '../services/mvp.service';
import { TimeserviceService } from '../services/timeservice.service';
import { PageEvent } from '@angular/material';

@Component({
  selector: "app-mvp-page",
  templateUrl: "./mvp-page.component.html",
  styleUrls: ["./mvp-page.component.css"]
})
export class MvpPageComponent implements OnInit {
  constructor(private mvpService: MvpService, private timeService:TimeserviceService) {
            this.timeService.getSesasonInfo().subscribe((res) => {
              this.currentSeason = res["value"];
              this.selectedSeason = res["value"];
              for (let i = 9; i <= this.currentSeason; i++) {
                this.seasonDropdown.push(i);
              }
              this.initMvps();
            });
  }

  currentSeason;
  selectedSeason;

  seasonDropdown = [];

  displayArray = [];

  length;
  pageSize = 15;

  pageEventHandler(pageEvent:PageEvent){

    let i = pageEvent.pageIndex * this.pageSize;
    let endSlice = i + this.pageSize;
    if (endSlice > this.mvpList.length) {
      endSlice = this.mvpList.length;
    }
    this.displayArray = [];
    this.displayArray = this.mvpList.slice(i, endSlice);

  }


  mvpList = [];
  ngOnInit(): void {


  }

  initMvps(){
        this.mvpService.getBySeason(this.selectedSeason).subscribe((res) => {
          this.mvpList = res;
          this.length = res.length;
          let endSlice = this.pageSize > res.length ? res.length : this.pageSize;
          this.displayArray = res.slice(0, endSlice);
        });
  }
}
