import { Component, OnInit, ViewChild } from '@angular/core';
import { MvpService } from '../services/mvp.service';
import { TimeserviceService } from '../services/timeservice.service';
import { PageEvent, MatPaginator } from "@angular/material";

@Component({
  selector: "app-potg-page",
  templateUrl: "./potg-page.component.html",
  styleUrls: ["./potg-page.component.css"],
})
export class PotgPageComponent implements OnInit {
  constructor(
    private mvpServ: MvpService,
    private timeService: TimeserviceService
  ) {
                this.timeService.getSesasonInfo().subscribe((res) => {
                  this.currentSeason = res["value"];
                  this.selectedSeason = res["value"];
                  for (let i = 9; i <= this.currentSeason; i++) {
                    this.seasonDropdown.push(i);
                  }
                  this.initPotgs();
                });
  }

  currentSeason;
  selectedSeason;
  seasonDropdown = [];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  length: number;
  pageSize: number = 9;
  displayArray = [];
  potgLink:string = '';

  pageEventHandler(pageEvent: PageEvent) {
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

  initPotgs(){
    this.mvpList = [];
      this.mvpServ
        .getMvpById("season",this.selectedSeason)
        .subscribe((mvps) => {
          console.log(mvps);
          mvps.forEach((m) => {
            if (m.potg_link && m.potg_link.length > 0) {
              this.mvpList.push(m);
            }
          });
          this.displayArray = this.mvpList.slice(
            0,
            this.pageSize
          );
          this.length = this.mvpList.length;
          this.paginator.firstPage();
        });

  }

  invert = 1;
  lastChoice;

  sort(prop) {
    if (this.lastChoice == prop) {
      this.invert = -1 * this.invert;
    } else {
      this.invert = 1;
    }
    this.lastChoice = prop;

    this.mvpList = this.mvpList.sort((a, b) => {
      let retVal = 0;
      if (a[prop] && b[prop]) {
        retVal = a[prop] - b[prop];
      }
      return retVal;
    });
    if (this.invert < 0) {
      this.mvpList = this.mvpList.reverse();
    }
    this.paginator.firstPage();
    this.displayArray = this.mvpList.slice(0, this.pageSize);
  }
}
