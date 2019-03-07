import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { PageEvent, MatPaginator } from '@angular/material';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { AuthService } from 'src/app/services/auth.service';
import { FilterService } from 'src/app/services/filter.service';


@Component({
  selector: 'app-caster-dashboard',
  templateUrl: './caster-dashboard.component.html',
  styleUrls: ['./caster-dashboard.component.css']
})
export class CasterDashboardComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public team:TeamService, private scheduleService:ScheduleService, private util:UtilitiesService, private Auth: AuthService,
    private filterService:FilterService) {

   }

  hideForm = true;
  selectedRound:any
  selectedDivision:any
  originalMatches:any
  filterMatches:any
  rounds=[];
  
  filterTeam:string='';
  scheduledOnlyFlt:boolean=false;

  times: any[] = [];
  suffix;
  friendlyTime;
  friendlyDate;
  amPm = ['PM', 'AM'];

  displayArray = [];
  length: number;
  pageSize: number = 10;
  filteredArray: any = [];
  pageIndex:number;
  tournamentOnlyFlt:false;
  divFlt;
  roundFlt;
  teamFlt;
  startTimeFlt;


  ngAfterViewInit(){
    this.paginator.pageIndex = 0;
  }

  pageEventHandler(pageEvent: PageEvent) {

    let i = pageEvent.pageIndex * this.pageSize;
    let endSlice = i + this.pageSize
    if (endSlice > this.filterMatches.length) {
      endSlice = this.filterMatches.length;
    }

    this.displayArray = [];
    this.displayArray = this.filterMatches.slice(i, endSlice)

  } 

  ngOnInit() {
      this.scheduleService.getAllMatches().subscribe(
        (sched) => {
          this.originalMatches = sched;
          this.length = sched.length;
          this.filterMatches = sched;
          this.filterMatches.forEach(match => {
            match.submitCaster = {
              "name":'',
              "URL":''
            }
            if (this.rounds.indexOf(match.round) < 0) {
              this.rounds.push(match.round);
            }
          });
          this.rounds = this.rounds.sort();
          this.displayArray = this.filterMatches.slice(0, 10);
        }
      )
    for (let i = 1; i < 13; i++) {
      for (let j = 0; j <= 3; j++) {
        let min: any = j * 15;
        if (min == 0) {
          min = '00';
        }
        let time = i + ":" + min;
        this.times.push(time);
      }
    }
  }

  resetTime(){
    this.startTimeFlt = null;
    this.friendlyDate = null;
    this.friendlyTime = null;
    this.doFilterMatches();
  }

  timeChanged(){

    if (this.friendlyDate && this.friendlyTime) {
      if (this.friendlyTime && this.suffix) {
        let years = this.friendlyDate.getFullYear();
        let month = this.friendlyDate.getMonth();
        let day = this.friendlyDate.getDate();

        let colonSplit = this.friendlyTime.split(':');
        colonSplit[1] = parseInt(colonSplit[1]);
        if (this.suffix == 'PM') {
          colonSplit[0] = parseInt(colonSplit[0]);
          colonSplit[0] += 12;
        }
        let setDate = new Date();
        setDate.setFullYear(years);
        setDate.setMonth(month);
        setDate.setDate(day);
        setDate.setHours(0);
        setDate.setMinutes(0);
        setDate.setMilliseconds(0);
        this.endTimeFlt = setDate.getTime() + 86400000;
        setDate.setHours(colonSplit[0]);
        setDate.setMinutes(colonSplit[1]);
        let msDate = setDate.getTime();
        this.startTimeFlt = msDate;
        this.doFilterMatches();
      } 
    } else if (this.friendlyDate){
      let years = this.friendlyDate.getFullYear();
      let month = this.friendlyDate.getMonth();
      let day = this.friendlyDate.getDate();
      let setDate = new Date();
      setDate.setFullYear(years);
      setDate.setMonth(month);
      setDate.setDate(day);
      setDate.setHours(0);
      setDate.setMinutes(0);
      setDate.setMilliseconds(0);
      this.endTimeFlt = setDate.getTime() + 86400000;
      let msDate = setDate.getTime();
      this.startTimeFlt = msDate;
      this.doFilterMatches();
    }



  }

  selected(div){
    this.divFlt = div;
    this.doFilterMatches();
  }

  //filters the matches based on selected criteria
   endTimeFlt;
  doFilterMatches() {
    this.filterMatches = this.originalMatches;
    if(!this.util.isNullOrEmpty(this.divFlt)){
      this.filterMatches = this.filterMatches.filter(match => {
        return this.filterService.testDivision(match, this.divFlt);
      });
    }
    if (!this.util.isNullOrEmpty(this.roundFlt)) {
      this.filterMatches = this.filterMatches.filter(match => {
        return this.filterService.testRound(match, this.roundFlt);
      });
    }
    if(!this.util.isNullOrEmpty(this.teamFlt)){
      this.filterMatches = this.filterMatches.filter(match => {
        return this.filterService.testName(match, this.teamFlt);
      });
    }
    if(!this.util.isNullOrEmpty(this.scheduledOnlyFlt)&&this.scheduledOnlyFlt){
      this.filterMatches = this.filterMatches.filter(match => {
        return this.filterService.testScheduled(match);
      });
    }
    if (!this.util.isNullOrEmpty(this.tournamentOnlyFlt)&&this.tournamentOnlyFlt) {
      this.filterMatches = this.filterMatches.filter(match => {
        return this.filterService.testTournament(match);
      });
    }
    if (!this.util.isNullOrEmpty(this.startTimeFlt)) {
      this.filterMatches = this.filterMatches.filter(match => {
        return this.filterService.testTime(match, this.startTimeFlt, this.endTimeFlt);
      });
    }
    this.length=this.filterMatches.length;
    this.displayArray = this.filterMatches.slice(0,this.pageSize>this.length? this.length:this.pageSize);
    this.paginator.firstPage();
  }



  checkRights(){
    let ret = false;
    if (this.Auth.getAdmin() && this.Auth.getAdmin().indexOf('match')>-1){
      ret = true;
    }
    return ret;
  }

  removeCaster(match){
          this.scheduleService.addCaster(match.matchId, '', '').subscribe(
            (res) => {
              console.log(res);
              let i = -1;
              this.originalMatches.forEach(
                (match, index)=>{
                  if(match.matchId == res.matchId){
                    i = index;
                  }
                }
              )
              if (i > -1) {
                this.originalMatches[i] = res;
              }
              this.displayArray.forEach(
                (match, index) => {
                  if (match.matchId == res.matchId) {
                    i = index;
                  }
                }
              )
              if(i>-1){
                this.displayArray[i] = res;
              }
              console.log(this.originalMatches[i]);
              // match = res;
            },
            (err) => {
              console.log(err);
            }
          )

  }

  showCasterNameUrl(match){
    let ret = false;
    if (this.util.returnBoolByPath(match, 'casterName')){
      if (match.casterName.length > 0){
        ret = true;
      }else{
        ret = false;
      }
    }else{
      ret = false;
    }
    return ret;
  }

  displayTime(ms) {
    let d = new Date(parseInt(ms));
    let day = d.getDate();
    let year = d.getFullYear();
    let month = d.getMonth();
    month = month + 1;
    let hours = d.getHours();
    let suffix = "AM";
    if (hours > 12) {
      hours = hours - 12;
      suffix = "PM";
    }

    let min = d.getMinutes();
    let minStr;
    if (min == 0) {
      minStr = '00';
    } else {
      minStr = min.toString();
    }
    let dateTime = month + '/' + day + '/' + year + ' @ ' + hours + ':' + minStr + " " + suffix;
    return dateTime;
  }

}
