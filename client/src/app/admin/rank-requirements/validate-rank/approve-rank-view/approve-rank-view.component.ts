import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlayerRankService } from 'src/app/services/player-rank.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: "app-approve-rank-view",
  templateUrl: "./approve-rank-view.component.html",
  styleUrls: ["./approve-rank-view.component.css"],
})
export class ApproveRankViewComponent implements OnInit {
  hlRankMetal;
  hlRankDivision;
  constructor(
    public User: UserService,
    private RankService: PlayerRankService
  ) {}

  queueItem;

  @Input() info: any;

  //Output bindings
  @Output() rankActioner = new EventEmitter();

  ngOnInit(): void {}

  actionRank(approve) {
    if(this.hlRankMetal == 'Unranked'){
      this.hlRankDivision = 0;
    }

    let payload = {
      seasonInf: { season: this.info.season, year: this.info.year },
      userId: this.info.userId,
      hlRankMetal: this.hlRankMetal,
      hlRankDivision: this.hlRankDivision,
      verified: approve,
    };

    if(!approve){
      let invalidReason = prompt('Enter some feedback for denial.','Invalid Image');
      payload['reason'] = invalidReason
    }

    this.RankService.adminActionRank(payload).subscribe(
      (res) => {
        this.rankActioner.emit(this.info);
      },
      (err) => {
        console.warn(err);
      }
    );

    console.log(this.hlRankMetal, this.hlRankDivision, approve);
  }
}
