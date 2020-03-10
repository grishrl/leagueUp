import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { Match } from '../../classes/match.class';
import { MvpService } from 'src/app/services/mvp.service';

@Component({
  selector: "app-potg-display",
  templateUrl: "./potg-display.component.html",
  styleUrls: ["./potg-display.component.css"]
})
export class PotgDisplayComponent implements OnInit {
  constructor(
    private ScheduleServ: ScheduleService,
    private MvpServ: MvpService
  ) {}

  @Input() potg;

  matchInfo: Match = new Match();
  ngOnInit(): void {
    if (this.potg) {
      this.ScheduleServ.getMatchInfo(this.potg.match_id).subscribe(res => {
        this.matchInfo = res;
      });
    }
  }

  smile(id) {
    this.MvpServ.upvotePotg(id).subscribe(
      res => {
        if(this.potg.likes){
          this.potg.likes += 1;
        }else{
          this.potg.likes = 1;
        }

      },
      err => {
        console.log(err);
      }
    );
  }
}
