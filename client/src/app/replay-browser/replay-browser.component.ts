import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';
import { PageEvent } from '@angular/material';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-replay-browser',
  templateUrl: './replay-browser.component.html',
  styleUrls: ['./replay-browser.component.css']
})
export class ReplayBrowserComponent implements OnInit {

  constructor(private scheduleService:ScheduleService) { }

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

  _selectedDiv;
  selectedDivision(div){
    this._selectedDiv=div;
    console.log(div);
  }

  ngOnInit() {
      this.scheduleService.getReportedMatches().subscribe(
        res=>{
          this.matches = res;
          this.matches.forEach(match=>{
            if(match.replays._id){
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
