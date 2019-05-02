import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { HotsProfileService } from 'src/app/services/hots-profile.service';

@Component({
  selector: 'app-team-stats',
  templateUrl: './team-stats.component.html',
  styleUrls: ['./team-stats.component.css']
})
export class TeamStatsComponent implements OnInit {

  constructor(private teamServ: TeamService, public hotsProfile: HotsProfileService) { }

  statistics = {
    stats:{
      stats:{
        average: {
          HeroDamage: 0,
          KDA: 0,
          SiegeDamage: 0,
          MinionDamage: 0,
          mercCaptures: 0,
          DamageTaken: 0,
          Healing: 0,
          pctWithHeroAdv: 0,
          TimeCCdEnemyHeroes: 0
        }
      }
    }
  };
  totalGames = 0;
  totalWins = 0;
  takedowns = 0;
  heroesPlayed = 0;
  initTeamStats(id){
    this.teamServ.getStatistics(id).subscribe(
      res=>{
        if(res && res.length>0){
          res.forEach(stats=>{
            console.log(stats);
            this.totalGames += stats.stats.totalMatches;
            this.totalWins += stats.stats.wins;
            this.takedowns += stats.stats.takedowns.total;
            let heroPlayedKeys = Object.keys(stats.stats.heroes);
            this.heroesPlayed += heroPlayedKeys.length;
          });
          // console.log(res[0]);
          this.statistics = res[0];
          this.roundTree(this.statistics);
          console.log('this.statistics', this.statistics);
        }
      },
      err=>{

      }
    )
  }

  roundTree(obj) {
    if (typeof obj == 'object') {
      let keys = Object.keys(obj);
      keys.forEach(key => {
        let item = obj[key];
        if (typeof item == 'object') {
          this.roundTree(item);
        } else {
          if (!isNaN(item)) {
            if (item<1 && item>0){
              item = item*100;
            }
            obj[key] = Math.round(item);
          }
        }
      })
    }
  }

  teamName:string;
  @Input() set team(val){
    if(val){
      this.teamName = val;
      this.initTeamStats(val);
    }
  }
  ngOnInit() {
  }

}
