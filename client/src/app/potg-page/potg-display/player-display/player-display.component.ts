import { Component, OnInit, Input } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Profile } from 'src/app/classes/profile.class';
import { MvpService } from 'src/app/services/mvp.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: "app-player-display",
  templateUrl: "./player-display.component.html",
  styleUrls: ["./player-display.component.css"]
})
export class PlayerDisplayComponent implements OnInit {
  @Input() playerId;

  constructor(public user: UserService, private mvpServ:MvpService, public util:UtilitiesService) {}

  returnedProfile = new Profile(
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  );
  mvpCounts=0;
  ngOnInit(): void {
    this.user.getUserById(this.playerId).subscribe(res => {
      this.returnedProfile = res;
    });
          this.mvpServ.getMvpById("player_id", this.playerId).subscribe(
            res => {
              if (res) {
                this.mvpCounts = res.length;
              }
            },
            err => {
              console.log(err);
            }
          );
  }

  estimateGamesPlayed() {
    let count = 0;
    if (
      this.returnedProfile.replays &&
      this.returnedProfile.replays.length > 0
    ) {
      count += this.returnedProfile.replays.length;
    }
    if (
      this.returnedProfile.replayArchive &&
      this.returnedProfile.replayArchive.length > 0
    ) {
      this.returnedProfile.replayArchive.forEach(season => {
        count += season.replays.length;
      });
    }
    return count;
  }
}
