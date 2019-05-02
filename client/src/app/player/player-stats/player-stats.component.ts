import { Component, OnInit, Input } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { HotsLogsService } from 'src/app/services/hots-logs.service';
import { HotsProfileService } from 'src/app/services/hots-profile.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-player-stats',
  templateUrl: './player-stats.component.html',
  styleUrls: ['./player-stats.component.css']
})
export class PlayerStatsComponent implements OnInit {

  constructor(private util: UtilitiesService, public hotsLogsService: HotsLogsService, public hotsProfile:HotsProfileService, private user:UserService) { }

  ngOnInit() {

  }

  noStats=false;
  losses=0;
  statistics = {
    stats:{
      averages: {
        HeroDamage: 0,
        KDA: 0,
        XPM:0,
        SiegeDamage:0,
        MercCampCaptures:0,
        MinionDamage:0,
        DamageSoaked:0,
        Healing:0
      },
      median:{
        TimeCCdEnemyHeroes:0,
        TimeSpentDead:0
      },
      stats:{
        Takedowns:0,
        Assists: 0
      },
      games:0,
      wins:0,
      takedowns:0
    }
  };
  initStats(){
    this.user.getStatistics(this.displayName).subscribe(
      res=>{
        if(res.length>0){
          this.statistics = res[0];
          this.roundTree(this.statistics);
          this.losses = this.statistics.stats.games - this.statistics.stats.wins
        }else{
          this.noStats=true;
        }

      },
      err=>{
        this.noStats=true;
        console.log(err);
      }
    )
  }

  roundTree(obj){

      if (typeof obj == 'object') {
        let keys = Object.keys(obj);
        keys.forEach(key => {
          let item = obj[key];
          if (typeof item == 'object') {
            this.roundTree(item);
          } else {
            if (!isNaN(item)) {
              obj[key] = Math.round(item);
            }
          }
        })
    }

  }

  toonHandle:string;
  @Input() set playerToon(toon){
    console.log(toon);
    this.toonHandle = toon;
  }

  displayName: string;
  @Input() set playerID(_id){
    console.log(_id);
    if(!this.util.isNullOrEmpty(_id)){
      this.displayName = _id;
      this.initStats();
    }
  }

  hotsLogsPlayerID: string;
  @Input() set hotslogsID(_id) {
    console.log(_id);
    if (!this.util.isNullOrEmpty(_id)) {
      this.hotsLogsPlayerID = _id;
      this.ngOnInit();
    }
  }

}
