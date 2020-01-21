import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TimeserviceService } from 'src/app/services/timeservice.service';
import { environment } from 'src/environments/environment';
import { ScheduleService } from 'src/app/services/schedule.service';
import { forEach as _forEach } from 'lodash';
import { HeroesProfileService } from 'src/app/services/heroes-profile.service';


@Component({
  selector: 'app-games-information',
  templateUrl: './games-information.component.html',
  styleUrls: ['./games-information.component.css']
})
export class GamesInformationComponent implements OnInit, OnChanges {

  constructor(public util: UtilitiesService, private timeService: TimeserviceService, private hp: HeroesProfileService, private scheduleService:ScheduleService) { }

  @Input() match;
  ngOnInit() {
    this.resultsMap = new Map<string, object>();
    if (this.match.hasOwnProperty('replays')) {
      _forEach(this.match.replays, (value, key) => {
        if (key != '_id') {
          let item = value;
          this.hp.getReplay(item.data).subscribe(
            reply => {
              if (reply && reply.name) {
                item['map'] = reply.name;
              }
              item['winner'] = this.match['other'][key]['winner'];
              this.resultsMap.set(key, item);
            }
          )
        }
      })

    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.ngOnInit();
  }

  resultsMap = new Map<string, object>();

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
    { "map": "Infernal Shrines", "image": "shrines-banner.png" },
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

  getBackground(map) {
    if (map) {
      let img;
      this.mapImage.forEach(image => {
        if (image.map == map) {
          img = image.image;
        }
      });
      if (img) {
        return 'https://s3.amazonaws.com/' + environment.s3bucketGeneralImage + '/' + img;
      } else {
        return 'https://s3.amazonaws.com/' + environment.s3bucketGeneralImage + '/' + this.mapImage[0].image;
      }
    } else {
      return 'https://s3.amazonaws.com/' + environment.s3bucketGeneralImage + '/' + this.mapImage[0].image;
    }
  }

  getWinner(ind) {
    // ind = ind+1;
    // let arg = this.match.other[ind.toString()].winner;
    return this.match[ind].teamName;
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



}
