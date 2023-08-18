import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { Match } from '../../../classes/match.class';
import { MvpService } from 'src/app/services/mvp.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: "app-potg-display",
  templateUrl: "./potg-display.component.html",
  styleUrls: ["./potg-display.component.css"]
})
export class PotgDisplayComponent implements OnInit {
  constructor(
    private ScheduleServ: ScheduleService,
    private MvpServ: MvpService,
    public auth:AuthService
  ) {}

  @Input() potg ;

  @Input() match = new Match();

  @Input() showPotg:boolean = true;

  @Input() showMvp:boolean = false;

  @ViewChild("potgContainer") container: ElementRef;

  loadReady=false;

  ngOnInit(): void {
    if (this.potg && !this.match.matchId) {
      this.ScheduleServ.getMatchInfo(this.potg.match_id).subscribe(res => {
        this.match = res;
        this.correctAutoPlay();
      });
    }else if(this.match.matchId && !this.potg){
      this.MvpServ.getMvpById('match_id', this.match.matchId).subscribe(res=>{
        this.potg = res;
        this.correctAutoPlay();
      })
    }else{
      this.correctAutoPlay();
    }
  }

  eleHeight;
  ngAfterViewInit() {
    this.eleHeight = (this.container.nativeElement.offsetWidth / 16) * 9;
    this.loadReady=true;
  }


  correctAutoPlay(){
        if (this.potg.potg_link) {
          if (this.potg.potg_link.includes("twitch.tv")) {
            if (!this.potg.potg_link.includes("autoplay")) {
              this.potg.potg_link += "&autoplay=false";
            }
            //&parent=localhost&parent=prod-ngs.herokuapp.com&parent=herokuapp.com&parent=www.nexusgamingseries.org
            this.potg.potg_link = `${this.potg.potg_link}&parent=localhost&parent=prod-ngs.herokuapp.com&parent=herokuapp.com&parent=www.nexusgamingseries.org&parent=nexusgamingseries.org&autoplay=false`;
          }
          if(!this.potg.potg_link.includes('https://')){
            this.potg.potg_link = `https://www.${this.potg.potg_link}`;
          }
        }
  }

  smile(id) {
    this.MvpServ.upvotePotg(id).subscribe(
      res => {
        if (this.potg.likes) {
          this.potg.likes += 1;
        } else {
          this.potg.likes = 1;
        }
      },
      err => {
        console.warn(err);
      }
    );
  }
}
