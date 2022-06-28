import { Component, OnInit, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';
import { Profile } from '../../../classes/profile.class';
import { AuthService } from 'src/app/services/auth.service';
import { TeamService } from 'src/app/services/team.service';
import { ConfirmRemoveMemberComponent } from '../../../modal/confirm-remove-member/confirm-remove-member.component';
import { EventEmitter } from '@angular/core';
import { PlayerRankService } from 'src/app/services/player-rank.service';
import { TimeService } from 'src/app/services/time.service';
import { find } from 'lodash';

@Component({
  selector: "app-player-small-card",
  templateUrl: "./player-small-card.component.html",
  styleUrls: ["./player-small-card.component.css"],
})
export class PlayerSmallCardComponent implements OnInit {
  constructor(
    public user: UserService,
    private Auth: AuthService,
    private team: TeamService,
    public dialog: MatDialog,
    private prServ: PlayerRankService,
    private timeServ: TimeService
  ) {}

  _captain;
  @Input() set captain(val) {
    if (val) {
      this._captain = val;
    }
  }

  @Input() assistantCaptains = [];

  _teamName;
  @Input() set teamName(val) {
    if (val) {
      this._teamName = val;
    }
  }

  @Input() showVerifiedRankings = false;

  @Input() showTeamLink = false;

  iAmMe = false;

  player: Profile = new Profile(
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
  matches = 0;
  initPlayer() {
    this.user.getUser(this.displayName).subscribe(
      (res) => {
        if (res) {
          this.iAmMe = res.displayName == this.Auth.getUser();
          let count = 0;
          if (res.replayArchive && res.replayArchive.length > 0) {
            res.replayArchive.forEach((arch) => {
              count += arch.replays.length;
            });
          }
          this.initRankVerification(res);
          count += res.replays.length;
          this.matches = count;
        }

        this.player = res;
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  initPlayerUUID() {
    this.user.getUserById(this.uuid).subscribe(
      (res) => {
        if (res) {
          this.iAmMe = res.displayName == this.Auth.getUser();
          let count = 0;
          if (res.replayArchive && res.replayArchive.length > 0) {
            res.replayArchive.forEach((arch) => {
              count += arch.replays.length;
            });
          }
          this.initRankVerification(res);
          count += res.replays.length;
          this.matches = count;
        }

        this.player = res;
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  @Output() playerRemove = new EventEmitter();

  dropEmmiter(x) {
    this.playerRemove.emit(x);
  }

  showRemovePlayer(): boolean {
    let ret = false;
    if (this._captain) {
      if (this._captain == this.displayName) {
        ret = false;
      } else if (this._captain == this.Auth.getUser()) {
        ret = true;
      } else {
        ret = false;
      }
    } else {
      ret = false;
    }
    return ret;
  }

  showRankings() {
    let aC = this.assistantCaptains.indexOf(this.Auth.getUser()) > -1;
    return this.showRemovePlayer() || aC;
    // return !!(!!this.Auth.getCaptain() && this.);
  }

  openConfirmRemove(player): void {
    const openConfirmRemove = this.dialog.open(ConfirmRemoveMemberComponent, {
      width: "450px",
      data: { player: player },
    });

    openConfirmRemove.afterClosed().subscribe((result) => {
      if (result != undefined && result != null) {
        if (result == "confirm") {
          this.removeMember(player);
        }
      }
    });
  }

  removeMember(player) {
    if (player && this._teamName) {
      this.team.removeUser(player, this._teamName).subscribe(
        (res) => {
          //if the user left the group, destroy their team local info so they can carry on
          if (this.Auth.getUser() == player) {
            this.Auth.destroyTeam();
            this.Auth.destroyTeamId();
          }
          this.dropEmmiter(player);
        },
        (err) => {
          console.warn(err);
        }
      );
    }
  }

  showLeave() {
    let ret = false;
    if (this._captain) {
      if (this._captain == this.displayName) {
        ret = false;
      } else {
        ret = this.Auth.getUser() == this.displayName;
      }
    } else {
      ret = this.Auth.getUser() == this.displayName;
    }
    return ret;
  }

  displayName: string;
  @Input() set playerID(val) {
    this.displayName = val;
    this.initPlayer();
  }

  uuid: string;
  @Input() set playerUID(val) {
    this.uuid = val;
    this.initPlayerUUID();
  }

  allRequiredRanks = true;
  initRankVerification(profile) {
    this.prServ.getRequiredRanks().subscribe((reqRank) => {
      if (profile.verifiedRankHistory.length > 0) {
        reqRank.data.forEach((rrEle) => {
          if (rrEle.required) {
            let vrh = find(profile.verifiedRankHistory, {
              year: rrEle.year + "",
              season: rrEle.season + "",
            });
            if (!vrh || vrh.status != "verified") {
              this.allRequiredRanks = false;
            }
          }
        });
      } else {
        this.allRequiredRanks = false;
      }
    });
  }

  ngOnInit() {}
}
