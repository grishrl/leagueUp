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

  statList=[
    'kills'
  ]

  ngOnInit() {
    let randomInt = Math.floor(Math.random() * this.statList.length);
    this.currStat = this.statList[randomInt];
    this.hp.getTopStats(this.currStat).subscribe(
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
