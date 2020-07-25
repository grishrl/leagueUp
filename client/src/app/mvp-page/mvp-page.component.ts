import { Component, OnInit } from '@angular/core';
import { MvpService } from '../services/mvp.service';
import { TimeserviceService } from '../services/timeservice.service';

@Component({
  selector: "app-mvp-page",
  templateUrl: "./mvp-page.component.html",
  styleUrls: ["./mvp-page.component.css"]
})
export class MvpPageComponent implements OnInit {
  constructor(private mvpService: MvpService, private timeService:TimeserviceService) {
            this.timeService.getSesasonInfo().subscribe((res) => {
              console.log("res>>", res);
              this.currentSeason = res["value"];
            });
  }

  currentSeason;

  mvpList = [];
  ngOnInit(): void {
    this.mvpService.getBySeason(this.currentSeason).subscribe(res => {
      this.mvpList = res;
    });
  }
}
