import { Component, Input, OnInit } from '@angular/core';
import { PlayerRankService } from 'src/app/services/player-rank.service';

@Component({
  selector: 'app-members-reporting',
  templateUrl: './members-reporting.component.html',
  styleUrls: ['./members-reporting.component.css']
})
export class MembersReportingComponent implements OnInit {

  constructor(private playerRank:PlayerRankService) { }

  memberLength = 0;
  reported=0;

  @Input() set teamMembers(val){
    if(val){
      this.memberLength = val.length;
          this.playerRank.getReportingCount(val).subscribe(
            (res) => {
              this.reported=res.reported;
            },
            (err) => {
              console.warn(err);
            }
          );
    }
  };

  ngOnInit(): void {

  }

}
