import { Injectable } from '@angular/core';
import { HeroesProfileService } from '../services/heroes-profile.service';
import { Subject } from 'rxjs';
import { forEach as _forEach } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class LeagueStatService {

  randomInt;
  displayStat;
  displayText;
  responseData; //local cache of response data

  constructor(private hp: HeroesProfileService) {
    this.randomInt = Math.floor(Math.random() * this.statList.length);
    this.init();
   }

   init(){
     this.hp.getOverallLeagueStats().subscribe(
       res => {
        if (res && res.data) {
          _forEach(res.data, (value, key) => {
            if (key == this.statList[this.randomInt].statName) {
              if (key == "secondsPlayed") {
                res.data[key] = Math.floor(res.data[key] / 60);
              }
            }
          });

          this.responseData = res.data; //add the response data to the local cache; we can use this to make more calls later;
          this.getStatInfo(); //once we have bootstrapped and have the info we need; call this method to start the observable's pipeline
        }

       },
       err => {
         console.warn(err);
       }
     )
   }

  public getStatInfoStream: Subject<object> = new Subject();
   //this is to be used as an external spur to action; if a component loses it's values it can call this method which will fire the next observable
   getStatInfo(){
     //if we don't have cached response data to use we will fire the http request again.
     if(this.responseData){
       this.getStatInfoStream.next({
         rInt: this.randomInt,
         stat: this.responseData[this.statList[this.randomInt].statName],
         text: this.statList[this.randomInt].displayText,
         image: this.statList[this.randomInt].image
       });
     }else{
       //firing the http request one more time.
       this.init();
     }

   }

  statList = [
    { "statName": "globesGathered", "displayText": "Globes Gathered", "image": "regenGlobe.jpg" },
    { "statName": "minionsKilled", "displayText": "Minions Slain", "image": "Mal_Ganis_Homescreen.jpg" },
    { "statName": "secondsPlayed", "displayText": "Minutes Played", "image": "timePlayed.jpg" },
    { "statName": "punishers-Summoned", "displayText": "Punishers Summoned", "image": "shrines-banner.jpg" },
    { "statName": "protectorsKilled", "displayText": "Shrine Protectors Slain", "image": "shrines-banner.jpg" },
    { "statName": "protectors-Summoned", "displayText": "Triglav Protectors Summoned", "image": "volskaya-banner.jpg" },
    { "statName": "dragonKnights-Summoned", "displayText": "Dragon Knights Summoned", "image": "dragon-shire-banner.jpg" },
    { "statName": "altarsChanneled", "displayText": "Altars Captured", "image": "towers-of-doom-banner.jpg" },
    { "statName": "spiderButtsTurnedIn", "displayText": "Gems Turned In", "image": "spider-banner.jpg" },
    { "statName": "spiders-Summoned", "displayText": "Spider Waves Summoned", "image": "spider-banner.jpg" },
    { "statName": "immortalsWon", "displayText": "Immortals Subdued", "image": "boe-banner.jpg" },
    { "statName": "calvaryCharges", "displayText": "Calvary Charges", "image": "alterac-banner.jpg" },
    { "statName": "tributesGathered", "displayText": "Tributes Gathered", "image": "cursed-banner.jpg" },
    { "statName": "curses", "displayText": "Enemy Teams Cursed", "image": "cursed-banner.jpg" },
    { "statName": "zergWaves", "displayText": "Zerg Waves Released", "image": "braxis-banner.jpg" },
    { "statName": "templeShots", "displayText": "Temple Shots Fired", "image": "sky-temple-banner.jpg" }
  ];




}
