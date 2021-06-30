import { Component, OnInit } from '@angular/core';
import { TimezoneService } from 'src/app/services/timezone.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/services/auth.service';
import { RequestService } from 'src/app/services/request.service';
import { Team } from 'src/app/classes/team.class';
import { DivisionService } from 'src/app/services/division.service';
import { forEach as _forEach } from 'lodash';


@Component({
  selector: 'app-team-market',
  templateUrl: './team-market.component.html',
  styleUrls: ['./team-market.component.css']
})
export class TeamMarketComponent implements OnInit {

  availability = {
    "monday": {
      "available": false,
      "startTime": null,
      "endTime": null
    },
    "tuesday": {
      "available": false,
      "startTime": null,
      "endTime": null
    },
    "wednesday": {
      "available": false,
      "startTime": null,
      "endTime": null
    }
    , "thursday": {
      "available": false,
      "startTime": null,
      "endTime": null
    }
    , "friday": {
      "available": false,
      "startTime": null,
      "endTime": null
    }
    , "saturday": {
      "available": false,
      "startTime": null,
      "endTime": null
    }
    , "sunday": {
      "available": false,
      "startTime": null,
      "endTime": null
    }
  };

  localResults = [];
  showSearch = false;
  selectedDivision
  hasSearched = false;

  searchParameters = {
    "divisions":[],
    "lowerMMR":null,
    "upperMMR":null,
    "competitiveLevel":null,
    "rolesNeeded":{
      "tank":false,
      "meleeassassin":false,
      "rangedassassin":false,
      "support":false,
      "offlane":false,
      "flex":false
    },
    "customTime":null,
    "customtimeZone":null,
    "customAvail":Object.assign({}, this.availability),
    "timezone":null
  }

  resetRoles(){
    _forEach(this.searchParameters.rolesNeeded, (value, key)=>{
      this.searchParameters.rolesNeeded[key] = false;
    });
  }

  resetMMRS(){
    this.searchParameters.lowerMMR = null;
    this.searchParameters.upperMMR = null;
  }

  competitonLevel = [
    { val: 1, display: 'Low' },
    { val: 3, display: 'Medium' },
    { val: 5, display: 'High' }
  ]

  divisions:any = [];

  selected(div) {
    this.searchParameters.divisions.push({key:div.displayName, value:div.divisionConcat});
  }

  toggleOther(other){
    other = !other;
  }

  search(){
    let postObj = {};

    // _forEach(this.searchParameters, (value, key)=>{
    //   if (key != 'divisions' && key != 'customTime' && key != 'rolesNeeded' && key != 'customAvail' && key != 'customtimeZone'
    //     && key != 'timezone' && this.searchParameters[key] != null) {
    //     postObj[key] = this.searchParameters[key];
    //   } else if (key == 'divisions' && this.searchParameters[key].length > 0) {
    //     postObj[key] = this.searchParameters[key];
    //   } else if (this.searchParameters[key] != null && key == 'customTime') {
    //     if (this.searchParameters[key] == 'profile') {
    //       postObj['getProfileTime'] = true;
    //     }
    //     let cleanTime = this.customTimeValidator(this.searchParameters['customAvail'])
    //     if (cleanTime != null) {
    //       postObj['times'] = cleanTime;
    //     }
    //   } else if (this.searchParameters[key] != null && key == 'rolesNeeded') {
    //     let roles = this.searchParameters[key];
    //     let roleKeys = Object.keys(this.searchParameters[key]);
    //     roleKeys.forEach(role => {
    //       if (roles[role]) {
    //         if (postObj['rolesNeeded'] == null || postObj['rolesNeeded'] == undefined) {
    //           postObj['rolesNeeded'] = {};
    //         }
    //         postObj['rolesNeeded'][role] = roles[role];
    //       }
    //     });
    //   } else if (this.searchParameters[key] != null && key == 'timezone') {
    //     if (this.searchParameters[key] == 'profile') {
    //       postObj['getProfileTimezone'] = true;
    //     } else {
    //       postObj['timezone'] = this.searchParameters['customtimeZone'];
    //     }
    //   }
    // });

    let keys = Object.keys(this.searchParameters);
    keys.forEach(key=>{
      if (key != 'divisions' && key != 'customTime' && key != 'rolesNeeded' && key != 'customAvail' && key != 'customtimeZone'
       && key != 'timezone' && this.searchParameters[key]!=null){
        postObj[key] = this.searchParameters[key];
      } else if (key == 'divisions' && this.searchParameters[key].length>0){
        postObj[key] = this.searchParameters[key];
      } else if (this.searchParameters[key] != null && key == 'customTime') {
        if (this.searchParameters[key] == 'profile'){
          postObj['getProfileTime']=true;
        }
        let cleanTime = this.customTimeValidator(this.searchParameters['customAvail'])
        if(cleanTime != null){
          postObj['times'] = cleanTime;
        }
      } else if (this.searchParameters[key] != null && key == 'rolesNeeded') {
        let roles = this.searchParameters[key];
        let roleKeys = Object.keys(this.searchParameters[key]);
        roleKeys.forEach(role=>{
          if(roles[role]){
            if (postObj['rolesNeeded'] == null || postObj['rolesNeeded'] == undefined){
              postObj['rolesNeeded']={};
            }
            postObj['rolesNeeded'][role]=roles[role];
          }
        });
      } else if (this.searchParameters[key] != null && key =='timezone'){
        if (this.searchParameters[key] == 'profile'){
          postObj['getProfileTimezone'] = true;
        }else{
          postObj['timezone'] = this.searchParameters['customtimeZone'];
        }
      }
    });
    this._team.searchTeams(postObj).subscribe(res=>{
      this.localResults = res;
      this.displayArray = res.slice(0,10);
      this.length = res.length;
      this.hasSearched = true;
    }, err=>{
      console.warn(err);
    })
  }


  clear(){
    this.showSearch = !this.showSearch;
    this.hasSearched = false;
    this.localResults=[];
    this.getNextPage(0,true);
  }

  filterSelected(){
    let divs = [];

    this.divisions.forEach(element => {
      let push = true;
      this.searchParameters.divisions.forEach(selDiv=>{
        if(element.divisionConcat == selDiv.value){
          push=false;
        }
      });
      if(push){
        divs.push(element)
      }
    });
    return divs;
  }

  constructor(private divisionService: DivisionService, private auth:AuthService, public timezone: TimezoneService, private util:UtilitiesService, public _team:TeamService,
    private request:RequestService) { }

  filterName: string = '';
  displayArray = [];
  length: number;
  pageSize: number = 10;
  filteredArray: any = [];

  pageEvent: PageEvent

  pageEventHandler(pageEvent: PageEvent) {
    let i = pageEvent.pageIndex;
    if(this.localResults.length>0){

       i = i * this.pageSize;
      let endSlice = i + this.pageSize
      if (endSlice > this.localResults.length) {
        endSlice = this.localResults.length;
      }
      this.displayArray = [];
      this.displayArray = this.localResults.slice(i,endSlice)
    }else{
      this._team.getTeamsOfPageNum(i, true).subscribe(res => {
        this.displayArray = res;
      }, err => {
        console.warn(err);
      })
    }


  }

   showRequestToJoin(){

      if (this.auth.getTeam() != null && this.auth.getTeam() != undefined ){
        return false;
      }else{
        return true;
      }

  }

  requestToJoin(team){
    let teamName = team.teamName_lower;
    this.request.joinTeamRequest(teamName).subscribe(
      res=>{

      },
      err=>{console.warn(err)}
    )
  }

  ngOnInit() {
    //gets division list
    this.divisionService.getDivisionInfo().subscribe((res) => {
      this.divisions = res;
    }, (err) => {
      console.warn(err);
    });

    this.getAllTeams();
    this.getNextPage(0, false);
  }

  getAllTeams(){

    this._team.getTeamNumber().subscribe(
      res => {
        this.length = res;
      },
      err => {
        console.warn(err)
      }
    )
  }

  getNextPage(page, showMsg){
    this._team.getTeamsOfPageNum(page, showMsg).subscribe(
      res=>{
        this.displayArray = res;
      },err=>{
        console.warn(err);
      }
    )
  }

  customTimeValidator(customTime) {
  let days = Object.keys(customTime);
  let retObj = {};
  days.forEach(day => {
    if (customTime[day].available) {
      if ((customTime[day].startTime != null || customTime[day].startTime != undefined) &&
        (customTime[day].endTime != null || customTime[day].endTime != undefined)) {
        retObj[day] = customTime[day];
      }
    }
  });
  let retkeys = Object.keys(retObj);
  // retkeys.forEach(key => {
  //   retObj[key]["startTimeNum"] = this.util.zeroGMT(retObj[key])
  // });
  if (retkeys.length > 0) {
    return retObj;
  } else {
    return null;
  }

}


}
