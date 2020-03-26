import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { HeroesProfileService } from 'src/app/services/heroes-profile.service';
import { forEach as _forEach } from 'lodash';

@Component({
  selector: 'app-team-stats',
  templateUrl: './team-stats.component.html',
  styleUrls: ['./team-stats.component.css']
})
export class TeamStatsComponent implements OnInit {

  constructor(private teamServ: TeamService, public hotsProfile: HeroesProfileService) { }

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
  uniqueHeros = [];
  initTeamStats(id){
    this.teamServ.getStatistics(id).subscribe(
      res=>{
        if(res && res.length>0){
          res.forEach(stats=>{
            this.totalGames += stats.stats.totalMatches;
            this.totalWins += stats.stats.wins;
            this.takedowns += stats.stats.takedowns.total;
            let heroPlayedKeys = Object.keys(stats.stats.heroes);
            heroPlayedKeys.forEach(element=>{
              if(this.uniqueHeros.indexOf(element)==-1){
                this.uniqueHeros.push(element);
              }
            })
          });
          this.heroesPlayed = this.uniqueHeros.length;
          this.statistics = res[0];
          this.roundTree(this.statistics);
        }
      },
      err=>{

      }
    )
  }

  //moves recursively through an objects structure rounding numbers it finds.
  roundTree(obj) {
    if(obj){
      if (typeof obj == 'object') {
        _forEach(obj, (value, key)=>{
          if (typeof value == 'object') {
            this.roundTree(value);
          } else {
            if (!isNaN(value)) {
              if (value < 1 && value > 0) {
                value = value * 100;
              }
              obj[key] = Math.round(value);
            }
          }
        })
      }
    }
  }

  teamName:string;
  hpLink:string;
  @Input() set team(val){
    if(val){
      this.teamName = val;
      this.hpLink = this.hotsProfile.getHPTeamLink(this.teamName);
      this.initTeamStats(val);
    }
  }
  ngOnInit() {
  }

}
