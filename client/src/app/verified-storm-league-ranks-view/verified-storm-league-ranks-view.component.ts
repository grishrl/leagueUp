import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { PlayerRankService } from '../services/player-rank.service';
// import { }

@Component({
  selector: "app-verified-storm-league-ranks-view",
  templateUrl: "./verified-storm-league-ranks-view.component.html",
  styleUrls: ["./verified-storm-league-ranks-view.component.css"],
})
export class VerifiedStormLeagueRanksViewComponent implements OnInit {
  constructor(
    private PlayerRankServ: PlayerRankService,
    public auth: AuthService
  ) {}

  toDisplay = [];

  uploadImage = false;
  saving = false;

  showUploadButton = false;
  userStatus = "";

  @Input() verifiedUserRanks;
  @Input() teamName;
  @Input() userId;

  ngOnInit(): void {
    this.PlayerRankServ.getRequiredRanks().subscribe(
      (res) => {
        if (res.data && res.data.length > 0) {
          res.data.forEach((item) => {
            if (item.required == true) {
              item.status = "na";
              this.toDisplay.push(item);
            }
          });
        }
        if (this.verifiedUserRanks && this.verifiedUserRanks.length > 0) {
          this.toDisplay.forEach((reqRank, index) => {
            this.verifiedUserRanks.forEach((verifiedRank) => {
              if (
                reqRank.year == verifiedRank.year &&
                reqRank.season == verifiedRank.season
              ) {
                this.toDisplay[index] = verifiedRank;
              }
            });
          });
        }
      },
      (err) => {
        console.warn(err);
      }
    );
      this.verifyUserStatus();

  }

  private verifyUserStatus(){

  if (this.auth.getUserId() === this.userId) {
    this.showUploadButton = true;
    this.userStatus = "self";
  } else if (
    this.auth.getCaptain() == "true" &&
    this.auth.getTeam() == this.teamName
  ) {
    this.showUploadButton = true;
    this.userStatus = "capt";
  }

}

  ngOnChanges(changes: SimpleChanges) {

    if(changes.teamName || changes.userId){
      this.verifyUserStatus();
    }
  }

  pendingSeason = {};

  openImageUploader(year, season) {
    this.pendingSeason = {};
    this.pendingSeason["year"] = year;
    this.pendingSeason["season"] = season;
    this.uploadImage = true;
  }

  imagedParsed(img) {
    let payload = {};
    // payload['_id'] = 'nil' //this needs to be passed in -- need this for captain submissions
    payload["logo"] = img;
    payload["seasonInf"] = this.pendingSeason;
    this.saving = true;
    if (this.userStatus == "self") {
      this.PlayerRankServ.uploadRankImage(payload).subscribe(
        (res) => {
          this.saving = false;
          this.toDisplay.forEach((reqRank, index) => {
            if (
              reqRank.year == this.pendingSeason["year"] &&
              reqRank.season == this.pendingSeason["season"]
            ) {
              let tO = this.toDisplay[index];
              tO["status"] = "pending";
              this.toDisplay[index] = tO;
            }
          });
          this.uploadImage = false;
        },
        (err) => {
          console.warn(err);
        }
      );
    } else if (this.userStatus == "capt") {
      payload["userId"] = this.userId;
      this.PlayerRankServ.captUploadRankImage(payload).subscribe(
        (res) => {
          this.saving = false;
          this.toDisplay.forEach((reqRank, index) => {
            if (
              reqRank.year == this.pendingSeason["year"] &&
              reqRank.season == this.pendingSeason["season"]
            ) {
              let tO = this.toDisplay[index];
              tO["status"] = "pending";
              this.toDisplay[index] = tO;
            }
          });
          this.uploadImage = false;
        },
        (err) => {
          console.warn(err);
        }
      );
    }
  }
}
