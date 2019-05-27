import { Injectable } from '@angular/core';
import { HotsProfileService } from '../services/hots-profile.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeagueStatService {

  randomInt;
  displayStat;
  displayText;
  responseData;

  constructor(private hp: HotsProfileService) {
    this.randomInt = Math.floor(Math.random() * this.statList.length);
    this.init();
   }

   init(){
     this.hp.getOverallLeagueStats().subscribe(
       res => {
         this.responseData = res.data;
         let keys = Object.keys(res.data);
         keys.forEach(key => {
           if (key == this.statList[this.randomInt].statName) {
             if (key == "secondsPlayed") {
               res.data[key] = Math.floor(res.data[key] / 60);
             }
             this.displayStat = res.data[key];
             this.getStatInfo();
           }
         })
       },
       err => {
         console.log(err);
       }
     )
   }

  public getStatInfoStream: Subject<object> = new Subject();

  getStatFromLocal(){
    if(this.responseData && this.randomInt){
      return {
        rInt: this.randomInt,
        stat: this.displayStat,
        text: this.statList[this.randomInt].displayText,
        image: this.statList[this.randomInt].image
      };
    }else{

    }
  }

   getStatInfo(){
     this.getStatInfoStream.next({
       rInt: this.randomInt,
       stat: this.displayStat,
       text: this.statList[this.randomInt].displayText,
       image: this.statList[this.randomInt].image
     });
   }

  statList = [
    { "statName": "globesGathered", "displayText": "Globes Gathered", "image": "regenGlobe.png" },
    { "statName": "minionsKilled", "displayText": "Minions Slain", "image": "Mal_Ganis_Homescreen.png" },
    { "statName": "secondsPlayed", "displayText": "Minutes Played", "image": "timePlayed.png" },
    { "statName": "punishers-Summoned", "displayText": "Punishers Summoned", "image": "shrines-banner.png" },
    { "statName": "protectorsKilled", "displayText": "Shrine Protectors Slain", "image": "shrines-banner.png" },
    { "statName": "protectors-Summoned", "displayText": "Triglov Protectors Summoned", "image": "volskaya-banner.png" },
    { "statName": "dragonKnights-Summoned", "displayText": "Dragon Knights Summoned", "image": "dragon-shire-banner.png" },
    { "statName": "altarsChanneled", "displayText": "Altars Captured", "image": "towers-of-doom-banner.png" },
    { "statName": "spiderButtsTurnedIn", "displayText": "Gems Turned In", "image": "spider-banner.png" },
    { "statName": "spiders-Summoned", "displayText": "Spider Waves Summoned", "image": "spider-banner.png" },
    { "statName": "immortalsWon", "displayText": "Immortals Subdued", "image": "boe-banner.png" },
    { "statName": "calvaryCharges", "displayText": "Calvary Charges", "image": "alterac-banner.png" },
    { "statName": "tributesGathered", "displayText": "Tributes Gathered", "image": "cursed-banner.png" },
    { "statName": "curses", "displayText": "Enemy Teams Cursed", "image": "cursed-banner.png" },
    { "statName": "zergWaves", "displayText": "Zerg Waves Released", "image": "braxis-banner.png" },
    { "statName": "templeShots", "displayText": "Temple Shots Fired", "image": "sky-temple-banner.png" }
  ];




}
