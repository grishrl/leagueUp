import { Component, OnInit, Input } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
// import { HotsLogsService } from 'src/app/services/hots-logs.service';
import { HeroesProfileService } from 'src/app/services/heroes-profile.service';
import { UserService } from 'src/app/services/user.service';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { forEach as _forEach } from 'lodash';

@Component({
  selector: "app-player-stats",
  templateUrl: "./player-stats.component.html",
  styleUrls: ["./player-stats.component.css"]
})
export class PlayerStatsComponent implements OnInit {
  constructor(
    private util: UtilitiesService,
    public hotsProfile: HeroesProfileService,
    private user: UserService) {}

  ngOnInit() {
    this.hotsProfile.getHPProfileLinkStream.subscribe(subj => {
      this.hpProfileLink = subj;
    });
    this.hotsProfile.getHPProfileLink(this.toonHandle, this.displayName);
  }

  hpProfileLink;

  noStats = false;
  losses = 0;
  statistics = {
    stats: {
      averages: {
        HeroDamage: 0,
        KDA: 0,
        XPM: 0,
        SiegeDamage: 0,
        MercCampCaptures: 0,
        MinionDamage: 0,
        DamageSoaked: 0,
        Healing: 0
      },
      median: {
        TimeCCdEnemyHeroes: 0,
        TimeSpentDead: 0
      },
      stats: {
        Takedowns: 0,
        Assists: 0
      },
      games: 0,
      wins: 0,
      takedowns: 0
    }
  };

  initStats() {
    // this.user.getStatistics(this.displayName).subscribe(
    //   res => {
    //     if (res.length > 0) {
    //       this.statistics = res[0];
    //       this.roundTree(this.statistics);
    //       this.losses =
    //         this.statistics.stats.games - this.statistics.stats.wins;
    //     } else {
    //       this.noStats = true;
    //     }
    //   },
    //   err => {
    //     this.noStats = true;
    //     console.log(err);
    //   }
    // );
  }

  roundTree(obj) {
    if (typeof obj == "object") {
      _forEach(obj, (value, key) => {
        if (typeof value == "object") {
          this.roundTree(value);
        } else {
          if (!isNaN(value)) {
            obj[key] = Math.round(value);
          }
        }
      });
    }
  }

  toonHandle: string;
  @Input() set playerToon(toon) {
    this.toonHandle = toon;
  }

  displayName: string;
  @Input() set playerID(_id) {
    if (!this.util.isNullOrEmpty(_id)) {
      this.displayName = _id;
      this.initStats();
    }
  }

  hotsLogsPlayerID: string;
  @Input() set hotslogsID(_id) {
    if (!this.util.isNullOrEmpty(_id)) {
      this.hotsLogsPlayerID = _id;
      this.ngOnInit();
    }
  }
}
