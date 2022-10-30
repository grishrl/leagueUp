import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ScheduleService } from '../../services/schedule.service';
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
    timer(0, 600).subscribe((timer) => {
      this.scheduleServ.getLiveMatches().subscribe((res) => {
        this.liveList = res;
        // this.liveList.push(
        //   {
        //     home:{teamName:"A"},
        //     away:{teamName:"B"},
        //     caster:"bozoboi",
        //     casterUrl:"twitch.tv/fanhots"
        //   }
        // )
      });
    });
  }

}
