import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';
import { timer } from 'rxjs';

@Component({
  selector: "app-currently-live-games",
  templateUrl: "./currently-live-games.component.html",
  styleUrls: ["./currently-live-games.component.css"]
})
export class CurrentlyLiveGamesComponent implements OnInit {
  constructor(private scheduleServ: ScheduleService) {}

  liveList = [];
  ngOnInit(): void {
    timer(0, 600000).subscribe(timer => {
      this.scheduleServ.getLiveMatches().subscribe(res => {
        this.liveList = res;
      });
    });
  }

}
