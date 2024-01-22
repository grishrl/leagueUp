import { Component, OnInit } from '@angular/core';
import { PlayerRankService } from 'src/app/services/player-rank.service';
import { findIndex } from 'lodash';

@Component({
  selector: "app-rank-requirements",
  templateUrl: "./rank-requirements.component.html",
  styleUrls: ["./rank-requirements.component.css"],
})
export class RankRequirementsComponent implements OnInit {
  constructor(private playerRank: PlayerRankService) {}

  year;
  season;

  years = [];
  seasons = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  requiredSeasons = {
    dataName:"requiredRankInfo",
    data:[]
  };

  ngOnInit(): void {
    let d = new Date(Date.now());
    let year = d.getFullYear();
    for (var i = 0; i < 19; i++) {
      this.years.push(year + i);
    }
    this.playerRank.getRequiredRanks().subscribe(
      res=>{
        if(res){
          this.requiredSeasons = res;
        }
      },
      err=>{
        console.warn(err);
      }
    )
  }

  saveAndRefresh(){
    this.playerRank.upsertRequiredRanks(this.requiredSeasons).subscribe(
      res=>{
        this.requiredSeasons = res;
      },
      err=>{
        console.warn(err);
      }
    )
  }

  submitNew() {
    let ind = findIndex(this.requiredSeasons.data, {year:this.year, season:this.season});
    if(ind>-1){
      alert('This season is all ready in the data!');
    }else{
      this.requiredSeasons.data.push( { year:this.year, season:this.season, required:true });
      this.saveAndRefresh();
    }
  }

  update(){
    this.saveAndRefresh()
  }
}
