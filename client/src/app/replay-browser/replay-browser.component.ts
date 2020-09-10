import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';
import { PageEvent } from '@angular/material/paginator';
import { environment } from 'src/environments/environment';
import { UtilitiesService } from '../services/utilities.service';

@Component({
  selector: 'app-replay-browser',
  templateUrl: './replay-browser.component.html',
  styleUrls: ['./replay-browser.component.css']
})
export class ReplayBrowserComponent implements OnInit {

  constructor(private scheduleService:ScheduleService, private util:UtilitiesService) { }

  matches= [];
  filterName: string = '';
  displayArray = [];
  length: number;
  pageSize: number = 10;
  filteredArray: any = [];

  pageEventHandler(pageEvent: PageEvent) {
    let i = pageEvent.pageIndex * this.pageSize;
    let endSlice = i + this.pageSize
    if (endSlice > this.filteredArray.length) {
      endSlice = this.filteredArray.length;
    }
    this.displayArray = [];
    this.displayArray = this.filteredArray.slice(i, endSlice)

  }

  selectedDiv;
  selectedDivision(div){
    this.selectedDiv=div;
    this.filterReplays();
  }

  team
  filterTeam(team){
    this.team = team;
    this.filterReplays();
  }

  filterReplays(){

    this.filteredArray = this.matches;

    if(this.selectedDiv != undefined && this.selectedDiv != null){
      this.filteredArray = this.filteredArray.filter(unit=>{
        return this.testDivision(unit, this.selectedDiv);
      })
    }
    if(!this.util.isNullOrEmpty(this.team)){
      this.filteredArray = this.filteredArray.filter(unit=>{
        return this.testName(unit, this.team)
      });
    }

    this.displayArray = this.filteredArray.slice(0,10);
    this.length = this.filteredArray.length;
  }

  private testName(unit, team) {
    let bool = false;
    let awayName = this.util.returnBoolByPath(unit, 'away.teamName') ? unit.away.teamName : '';
    let homeName = this.util.returnBoolByPath(unit, 'home.teamName') ? unit.home.teamName : '';
      awayName = awayName.toLowerCase();
      homeName = homeName.toLowerCase();
      let flt = team.toLowerCase();
      if (awayName.indexOf(flt) > -1 || homeName.indexOf(flt) > -1) {
        bool = true;
      }
      else {
        bool = false;
      }

    return bool;
  }

  private testDivision(unit, flt) {
    return unit.divisionConcat == flt.divisionConcat;
  }

  ngOnInit() {
      this.scheduleService.getReportedMatches().subscribe(
        res=>{
          this.matches = res;
          this.matches.forEach(match=>{
            if(this.util.returnBoolByPath(match,'replays._id')){
              delete match.replays._id;
            }
          });
          this.filteredArray = this.matches;
          this.length = this.filteredArray.length;
          this.displayArray = this.matches.slice(0, 10);
        },err=>{
          console.log(err);
        }
      )
  }

  replayFQDN(replay){
    let url = 'https://s3.amazonaws.com/' + environment.s3bucketReplays + '/' + replay;
    return url;
  }

}
