import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TimeService } from 'src/app/services/time.service';
import { environment } from 'src/environments/environment';
import { ScheduleService } from 'src/app/services/schedule.service';
import { forEach as _forEach } from 'lodash';
import { HeroesProfileService } from 'src/app/services/heroes-profile.service';
import { Replay } from 'src/app/classes/match.class';


@Component({
  selector: "app-games-information",
  templateUrl: "./games-information.component.html",
  styleUrls: ["./games-information.component.css"],
})
export class GamesInformationComponent implements OnInit, OnChanges {
  constructor(
    public util: UtilitiesService,
    private timeService: TimeService,
    private hp: HeroesProfileService,
    private scheduleService: ScheduleService
  ) {}

  hasMapBans = false;

  @Input() match;
  ngOnInit() {
    this.hasMapBans = this.util.hasMapBans(this.match);
    this.resultsMap = new Map<string, Replay>();
    if (this.match.hasOwnProperty("replays")) {
      _forEach(this.match.replays, (value, key) => {
        if (key != "_id") {
          let item = value;
          this.hp.getReplay(item.data).subscribe((reply) => {
            if (reply && reply.name) {
              item["map"] = reply.name;
            }
            if(this.util.returnBoolByPath(this.match, `other.${key}.winner`)){
              item["winner"] = this.match["other"][key]["winner"];
            }else{
              item["winner"] = "Unreported";
            }
            this.resultsMap.set(key, item);
          });
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.ngOnInit();
  }

  resultsMap = new Map<string, Replay>();

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
    { map: "noMatch", image: "Mal_Ganis_Homescreen.jpg" },
    { map: "Infernal Shrines", image: "shrines-banner.jpg" },
    { map: "Volskaya Foundry", image: "volskaya-banner.jpg" },
    { map: "Dragon Shire", image: "dragon-shire-banner.jpg" },
    { map: "Towers of Doom", image: "towers-of-doom-banner.jpg" },
    { map: "Tomb of the Spider Queen", image: "spider-banner.jpg" },
    { map: "Battlefield of Eternity", image: "boe-banner.jpg" },
    { map: "Alterac Pass", image: "alterac-banner.jpg" },
    { map: "Cursed Hollow", image: "cursed-banner.jpg" },
    { map: "Braxis Holdout", image: "braxis-banner.jpg" },
    { map: "Sky Temple", image: "sky-temple-banner.jpg" },
    { map: "Hanamura Temple", image: "hanamura-banner.jpg" },
  ];

  getBackground(map) {
    if (map) {
      let img;
      this.mapImage.forEach((image) => {
        if (image.map == map) {
          img = image.image;
        }
      });
      if (img) {
        return (
          "https://s3.amazonaws.com/" +
          environment.s3bucketGeneralImage +
          "/" +
          img
        );
      } else {
        return (
          "https://s3.amazonaws.com/" +
          environment.s3bucketGeneralImage +
          "/" +
          this.mapImage[0].image
        );
      }
    } else {
      return (
        "https://s3.amazonaws.com/" +
        environment.s3bucketGeneralImage +
        "/" +
        this.mapImage[0].image
      );
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
      if (side == "home") {
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
