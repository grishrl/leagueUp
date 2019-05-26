import { Component, OnInit } from '@angular/core';
import { HotsProfileService } from '../services/hots-profile.service';

@Component({
  selector: 'app-top-stats-widget',
  templateUrl: './top-stats-widget.component.html',
  styleUrls: ['./top-stats-widget.component.css']
})
export class TopStatsWidgetComponent implements OnInit {

  constructor(private hp:HotsProfileService) { }

  stats=[]
  currStat;
  displayStat;

  statList=[
    {stat:'kills', displayText:'Top Kills'},
    {stat:'assists',displayText:'Top Assists'},
    { stat: 'takedowns', displayText: 'Top Takedowns' },
    { stat: 'deaths', displayText: 'Top Deaths' },
    { stat: 'highest_kill_streak', displayText: 'Highest Kill Streak' },
    { stat: 'hero_damage',displayText:'Top Hero Damage'},
    { stat: 'siege_damage', displayText: 'Top Siege Damage' },
    { stat: 'structure_damage', displayText: 'Top Structure Damage'},
    { stat: 'minion_damage', displayText: 'Top Minion Damage' },
    { stat: 'creep_damage', displayText: 'Top Creep Damage' },
    { stat: 'summon_damage', displayText: 'Top Summon Damage' },
    { stat: 'time_cc_enemy_heroes', displayText: 'Most Time CC Enemy Heroes' },
    { stat: 'healing', displayText: 'Top Healing' },
    { stat: 'self_healing', displayText: 'Top Self Healing' },
    { stat: 'damage_taken', displayText: 'Top Damage Taken' },
    { stat: 'experience_contribution', displayText: 'Top Experience Contribution' },
    { stat: 'town_kills', displayText: 'Top Structure Kills' },
    { stat: 'time_spent_dead', displayText: 'Top Time Spent Dead' },
    { stat: 'merc_camp_captures', displayText: 'Top Mercenary Captures' },
    { stat: 'watch_tower_captures', displayText: 'Top Vision Tower Captures' },
    { stat: 'meta_experience', displayText: 'Top Meta Experience?' },
    { stat: 'protection_allies', displayText: 'Top Ally Protection' },
    { stat: 'silencing_enemies', displayText: 'Most Time Silencing Enemy Heroes' },
    { stat: 'rooting_enemies', displayText: 'Top Rooting Enemy Heroes' },
    { stat: 'stunning_enemies', displayText: 'Most Time Stunning Enemy Heroes' },
    { stat: 'clutch_heals', displayText: 'Most Clutch Heals' },
    { stat: 'escapes', displayText: 'Most Escapes' },
    { stat: 'vengeance', displayText: 'Top Vengeance' },
    { stat: 'outnumbered_deaths', displayText: 'Top Outnumbered Deaths' },
    { stat: 'teamfight_escapes', displayText: 'Most Teamfight Escapes' },
    { stat: 'teamfight_healing', displayText: 'Top Teamfight Healing' },
    { stat: 'teamfight_damage_taken', displayText: 'Top Teamfight Damage Taken' },
    { stat: 'teamfight_hero_damage', displayText: 'Top Teamfight Hero Damage' },
    { stat: 'multikill', displayText: 'Most Multi-Kills' },
    { stat: 'physical_damage', displayText: 'Top Physical Damage' },
    { stat: 'spell_damage', displayText: 'Top Spell Damage' },
  ]

  ngOnInit() {
    let randomInt = Math.floor(Math.random() * this.statList.length);
    this.currStat = this.statList[randomInt];

    this.displayStat = this.currStat.displayText;
    this.hp.getTopStats(this.currStat.stat).subscribe(
      res=>{
        // console.log(res);
        let object = res.data;
        let keys = Object.keys(object);
        keys.forEach(key =>{
          let tO = {};
          tO['name']=key;
          tO['points']=object[key];
          this.stats.push(tO);
        });
      },
      err=>{
        console.log(err);
      }
    )
  }

}
