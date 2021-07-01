import { Component, OnInit } from '@angular/core';
import { HeroesProfileService } from '../../services/heroes-profile.service';
import { UserService } from '../../services/user.service';
import { forEach as _forEach } from 'lodash';
import { TimeserviceService } from '../../services/timeservice.service';

@Component({
  selector: 'app-top-stats-widget',
  templateUrl: './top-stats-widget.component.html',
  styleUrls: ['./top-stats-widget.component.css']
})
export class TopStatsWidgetComponent implements OnInit {

  offSeason:boolean = false;
  constructor(private hp: HeroesProfileService, public user: UserService, private timeService:TimeserviceService) {
            this.timeService.getSesasonInfo().subscribe(res => {
              if (Date.now() < res["data"].seasonStartDate) {
                this.offSeason = true;
              }
              // this.seasonStartDate = ;
              // this.registrationOpen = res["data"].registrationOpen;
              this.initialize();
            });
   }

  stats = []
  currStat;
  displayStat;

  statList = [
    {
      "stat": "kills",
      "displayText": "Top Kills",
      "hpKey": "total_kills"
    },
    {
      "stat": "assists",
      "displayText": "Top Assists",
      "hpKey": "total_assists"
    },
    {
      "stat": "takedowns",
      "displayText": "Top Takedowns",
      "hpKey": "total_takedowns"
    },
    {
      "stat": "deaths",
      "displayText": "Top Deaths",
      "hpKey": "total_deaths"
    },
    {
      "stat": "highest_kill_streak",
      "displayText": "Total Kill Streak Count",
      "hpKey": "total_highest_kill_streak"
    },
    {
      "stat": "hero_damage",
      "displayText": "Top Hero Damage",
      "hpKey": "total_hero_damage"
    },
    {
      "stat": "siege_damage",
      "displayText": "Top Siege Damage",
      "hpKey": "total_siege_damage"
    },
    {
      "stat": "structure_damage",
      "displayText": "Top Structure Damage",
      "hpKey": "total_structure_damage"
    },
    {
      "stat": "minion_damage",
      "displayText": "Top Minion Damage",
      "hpKey": "total_minion_damage"
    },
    {
      "stat": "creep_damage",
      "displayText": "Top Creep Damage",
      "hpKey": "total_creep_damage"
    },
    {
      "stat": "summon_damage",
      "displayText": "Top Summon Damage",
      "hpKey": "total_summon_damage"
    },
    {
      "stat": "time_cc_enemy_heroes",
      "displayText": "Most Time CC Enemy Heroes",
      "hpKey": "total_time_cc_enemy_heroes"
    },
    {
      "stat": "healing",
      "displayText": "Top Healing",
      "hpKey": "total_healing"
    },
    {
      "stat": "self_healing",
      "displayText": "Top Self Healing",
      "hpKey": "total_self_healing"
    },
    {
      "stat": "damage_taken",
      "displayText": "Top Damage Taken",
      "hpKey": "total_damage_taken"
    },
    {
      "stat": "experience_contribution",
      "displayText": "Top Experience Contribution",
      "hpKey": "total_experience_contribution"
    },
    {
      "stat": "town_kills",
      "displayText": "Top Structure Kills",
      "hpKey": "total_town_kills"
    },
    {
      "stat": "time_spent_dead",
      "displayText": "Top Time Spent Dead",
      "hpKey": "total_time_spent_dead"
    },
    {
      "stat": "merc_camp_captures",
      "displayText": "Top Mercenary Captures",
      "hpKey": "total_merc_camp_captures"
    },
    {
      "stat": "watch_tower_captures",
      "displayText": "Top Vision Tower Captures",
      "hpKey": "total_watch_tower_captures"
    },
    {
      "stat": "meta_experience",
      "displayText": "Top Meta Experience",
      "hpKey": "total_meta_experience"
    },
    {
      "stat": "protection_allies",
      "displayText": "Top Ally Protection",
      "hpKey": "total_protection_allies"
    },
    {
      "stat": "silencing_enemies",
      "displayText": "Most Time Silencing Enemy Heroes",
      "hpKey": "total_silencing_enemies"
    },
    {
      "stat": "rooting_enemies",
      "displayText": "Top Rooting Enemy Heroes",
      "hpKey": "total_rooting_enemies"
    },
    {
      "stat": "stunning_enemies",
      "displayText": "Most Time Stunning Enemy Heroes",
      "hpKey": "total_stunning_enemies"
    },
    {
      "stat": "clutch_heals",
      "displayText": "Most Clutch Heals",
      "hpKey": "total_clutch_heals"
    },
    {
      "stat": "escapes",
      "displayText": "Most Escapes",
      "hpKey": "total_escapes"
    },
    {
      "stat": "vengeance",
      "displayText": "Top Vengeance",
      "hpKey": "total_vengeance"
    },
    {
      "stat": "outnumbered_deaths",
      "displayText": "Top Outnumbered Deaths",
      "hpKey": "total_outnumbered_deaths"
    },
    {
      "stat": "teamfight_escapes",
      "displayText": "Most Teamfight Escapes",
      "hpKey": "total_teamfight_escapes"
    },
    {
      "stat": "teamfight_healing",
      "displayText": "Top Teamfight Healing",
      "hpKey": "total_teamfight_healing"
    },
    {
      "stat": "teamfight_damage_taken",
      "displayText": "Top Teamfight Damage Taken",
      "hpKey": "total_teamfight_damage_taken"
    },
    {
      "stat": "teamfight_hero_damage",
      "displayText": "Top Teamfight Hero Damage",
      "hpKey": "total_teamfight_hero_damage"
    },
    {
      "stat": "multikill",
      "displayText": "Most Multi-Kills",
      "hpKey": "total_multikill"
    },
    {
      "stat": "physical_damage",
      "displayText": "Top Physical Damage",
      "hpKey": "total_physical_damage"
    },
    {
      "stat": "spell_damage",
      "displayText": "Top Spell Damage",
      "hpKey": "total_spell_damage"
    }
  ]

  ngOnInit() {

  }

  initialize(){
        this.stats = [];
        let randomInt = Math.floor(Math.random() * this.statList.length);
        this.currStat = this.statList[randomInt];

        this.displayStat = this.currStat.displayText;
        if (!this.offSeason) {
          this.hp.getTopStats(this.currStat.stat).subscribe(
            (res) => {
              if (res) {
                let object = res.data;
                _forEach(object, (value, key) => {
                  let tO = {};

                  tO["name"] = value["battletag"];
                  tO["points"] = value[this.currStat.hpKey];
                  this.stats.push(tO);
                });
              } else {
                console.warn("TopStatsWidgetComponent: no stats found");
              }
            },
            (err) => {
              console.warn(err);
            }
          );
        }

  }

}
