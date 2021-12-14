import { Component, OnInit, ViewChild } from '@angular/core';
import { MvpService } from '../../services/mvp.service';
import { TimeService } from '../../services/time.service';
import { PageEvent, MatPaginator } from "@angular/material/paginator";
import { UtilitiesService } from '../../services/utilities.service';

@Component({
  selector: "app-potg-page",
  templateUrl: "./potg-page.component.html",
  styleUrls: ["./potg-page.component.css"],
})
export class PotgPageComponent implements OnInit {
  constructor(
    private mvpServ: MvpService,
    private timeService: TimeService,
    private util:UtilitiesService
  ) {
                this.timeService.getSesasonInfo().subscribe((res) => {
                  this.currentSeason = res.value;
                  this.selectedSeason = res.value;
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
          mvps.forEach((m) => {
            if (m.potg_link && m.potg_link.length > 0) {
              this.mvpList.push(m);
            }
          });
          this.sort('timeStamp');
          // this.displayArray = this.mvpList.slice(
          //   0,
          //   this.pageSize
          // );
          this.currentChoice = 'timeStamp';
          this.length = this.mvpList.length;
          this.paginator.firstPage();
        });

  }

  invert = true;
  lastChoice;
  currentChoice;

  sort(prop) {
    this.currentChoice = prop;
    if (this.lastChoice == prop) {
      this.invert = !this.invert;
    } else {
      this.invert = true;
    }
    this.lastChoice = prop;
    this.mvpList = this.mvpList.sort((a, b) => {
      let retVal = 0;
      if (this.util.returnBoolByPath(a, prop) && this.util.returnBoolByPath(b, prop)) {
        retVal = a[prop] - b[prop];
      }
      return retVal;
    });

    if (this.invert) {
      this.mvpList = this.mvpList.reverse();
    }

    this.paginator.firstPage();
    this.displayArray = this.mvpList.slice(0, this.pageSize);
  }
}
