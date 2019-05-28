import { Component, OnInit } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { Match } from 'src/app/classes/match.class';
import { HotsProfileService } from 'src/app/services/hots-profile.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-match-results-view',
  templateUrl: './match-results-view.component.html',
  styleUrls: ['./match-results-view.component.css']
})
export class MatchResultsViewComponent implements OnInit {

  recId;
  constructor(private util: UtilitiesService, private sheduleService:ScheduleService, private route: ActivatedRoute, public team: TeamService, private hp:HotsProfileService) {
    if (this.route.snapshot.params['id']) {
      this.recId = this.route.snapshot.params['id'];
    }
  }

  match: Match = new Match();
  resultsArray = [];

  ngOnInit() {
    this.sheduleService.getMatchInfo(this.recId).subscribe(
      res=>{
        console.log(res);
        this.match = res;
        if(res.hasOwnProperty('replays')){
          let keys = Object.keys(res.replays);
          keys.forEach(key =>{
            if(key != '_id'){
              let item = res.replays[key];
              this.hp.getReplay(item.data).subscribe(
                reply=>{
                  console.log(reply);
                  if(reply && reply.name){
                    item['map'] = reply.name;
                  }
                  this.resultsArray.push(
                    item
                  );
                }
              )
            }

          });
        }
      },
      err=>{

      }
    )
  }
  //test

/*
ControlPoints: 'Sky Temple',
  TowersOfDoom: 'Towers of Doom',
  // HauntedMines: 'Haunted Mines',
  BattlefieldOfEternity: 'Battlefield of Eternity',
  // BlackheartsBay: "Blackheart's Bay",
  CursedHollow: 'Cursed Hollow',
  DragonShire: 'Dragon Shire',
  // HauntedWoods: 'Garden of Terror',
  Shrines: 'Infernal Shrines',
  Crypts: 'Tomb of the Spider Queen',
  Volskaya: 'Volskaya Foundry',
  // 'Warhead Junction': 'Warhead Junction',   // blizz why
  // BraxisHoldout: 'Braxis Holdout',
  // Hanamura: 'Hanamura',
  AlteracPass: 'Alterac Pass'
*/

  mapImage = [

    { "map": "noMatch", "image": "Mal_Ganis_Homescreen.png" },
    { "map":"Infernal Shrines", "image": "shrines-banner.png" },
    { "map": "Volskaya Foundry", "image": "volskaya-banner.png" },
    { "map": "Dragon Shire", "image": "dragon-shire-banner.png" },
    { "map": "Towers of Doom", "image": "towers-of-doom-banner.png" },
    { "map": "Tomb of the Spider Queen", "image": "spider-banner.png" },
    { "map": "Battlefield of Eternity", "image": "boe-banner.png" },
    { "map": "Alterac Pass", "image": "alterac-banner.png" },
    { "map": "Cursed Hollow", "image": "cursed-banner.png" },
    { "map": "Braxis Holdout", "image": "braxis-banner.png" },
    { "map": "Sky Temple", "image": "sky-temple-banner.png" }
  ]

  getBackground(map){
    if(map){
      let img;
      this.mapImage.forEach(image=>{
        if(image.map == map){
          img = image.image;
        }
      });
      if(img){
        return 'https://s3.amazonaws.com/' + environment.s3bucketGeneralImage + '/' + img;
      }else{
        return 'https://s3.amazonaws.com/' + environment.s3bucketGeneralImage + '/' + this.mapImage[0].image;
      }
    }else{
      return 'https://s3.amazonaws.com/' + environment.s3bucketGeneralImage + '/' + this.mapImage[0].image;
    }
  }

  getWinner(ind){
    ind = ind+1;
    let arg = this.match.other[ind.toString()].winner;
    return this.match[arg].teamName;
  }

  dominator(match, side) {
    let ret = false;
    if (match.forfeit) {
      let ret = false;
    } else {
      if (side == 'home') {
        if (match.home.score == 2 && match.away.score == 0) {
          ret = true;
        }
      } else {
        if (match.away.score == 2 && match.home.score == 0) {
          ret = true;
        }
      }
    }
    return ret;
  }

  reportScore(match, side) {
    let ret;
    if (match.forfeit) {
      if (match[side].score == 0) {
        ret = 'F';
      } else {
        ret = 0;
      }
    } else {
      ret = match[side].score;
    }
    return ret;
  }

}
