import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HotsProfileService } from '../services/hots-profile.service';
import { LeagueStatService } from './league-stat.service';

@Component({
  selector: 'app-league-stats',
  templateUrl: './league-stats.component.html',
  styleUrls: ['./league-stats.component.css']
})
export class LeagueStatsComponent implements OnInit {

  constructor(private lstat: LeagueStatService) {
   }


  displayText:string='';
  imgSrc: string = '';
  displayStat:string = '';
  randomInt;

  show=false;

  ngOnInit() {
    console.log('on init')
    this.lstat.getStatInfoStream.subscribe(
      obj => {
        console.log('reply');
        this.randomInt = obj['rInt'];
        this.imgSrc = 'https://s3.amazonaws.com/' + environment.s3bucketGeneralImage + '/' + obj['image'];
        this.displayStat = obj['stat'];
        this.displayText = obj['text'];
        this.show = true;
      }
    )
    }

ngAfterViewInit(){

}

  returnStyle(){
    return {
      'background': 'url(' + this.imgSrc + ')',
      'background-size': 'cover'
    }
  }

  returnClass(){
    if (this.randomInt == 0 || this.randomInt == 2) {
      return 'largeStatContainer';
    }else{
      return 'smallStatContainer';
    }
  }

  returnMargin(){
    let margin = '55px'
    if (this.randomInt == 0 || this.randomInt == 2) {
      margin = '77px'
    }
    return{
      'margin-top':margin
    };
  }

}
