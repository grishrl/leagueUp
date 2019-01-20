import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/services/auth.service';
import { TimezoneService } from 'src/app/services/timezone.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';
import { RequestService } from 'src/app/services/request.service';
import { DivisionService } from 'src/app/services/division.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-marketplace',
  templateUrl: './user-marketplace.component.html',
  styleUrls: ['./user-marketplace.component.css']
})
export class UserMarketplaceComponent implements OnInit {

  constructor(private divisionService: DivisionService, private auth: AuthService, public _userService:UserService, public timezone: TimezoneService, private util: UtilitiesService, public _team: TeamService,
    private request: RequestService) { }

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
  divisions = [];
  hasSearched = false;
  hlDivision = [1, 2, 3, 4, 5];
  competitonLevel = [
    { val: 1, display: 'Low' },
    { val: 3, display: 'Medium' },
    { val: 5, display: 'High' }
  ]
  hlMedals = ['Grand Master', 'Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Unranked'];
  selectedDivision
  showSearch = false;
  searchParameters = {
    "divisions": [],
    "lowerMMR": null,
    "upperMMR": null,
    "competitiveLevel": null,
    "rolesNeeded": {
      "tank": false,
      "meleeassassin": false,
      "rangedassassin": false,
      "support": false,
      "offlane": false,
      "flex": false
    },
    "customTime": null,
    "customtimeZone": null,
    "customAvail": Object.assign({}, this.availability),
    "timezone": null
  }

  // showInviteButton = false;

  filterName: string = '';
  displayArray = [];
  length: number;
  pageSize: number = 10;
  filteredArray: any = [];

  pageEvent: PageEvent

  pageEventHandler(pageEvent: PageEvent) {
    let i = pageEvent.pageIndex;
    if (this.localResults.length > 0) {

      i = i * this.pageSize;
      let endSlice = i + this.pageSize
      if (endSlice > this.localResults.length) {
        endSlice = this.localResults.length;
      }
      this.displayArray = [];
      this.displayArray = this.localResults.slice(i, endSlice)
    } else {
      this.getNextPage(this.getFiltered, i, true);
    }


  }

  clear() {
    this.showSearch = !this.showSearch;
    this.hasSearched = false;
    this.localResults = [];
    this.getNextPage(this.getFiltered, 0, true);
  }

  teamInfo;

  getFiltered = false;

  ngOnInit() {
    //gets division list
    this.divisionService.getDivisionInfo().subscribe((res) => {
      this.divisions = res;
    }, (err) => {
      console.log(err);
    });

    this._team.getTeam(this.auth.getTeam()).subscribe( res =>{
      this.teamInfo = res;
    }, err=>{
      console.log(err);
    })

    this.getFiltered = this.auth.getCaptain() == 'true';

    this.getAllUsers(this.getFiltered);
    this.getNextPage(this.getFiltered, 0, false);
  }

  getAllUsers(filter) {
    console.log('filter ', filter)
    if(filter){
      this._userService.getFilteredUsersNumber().subscribe(
        res=>{
          this.length = res;
        },
        err=>{
          console.log();
        }
      )
    }else{
      this._userService.getUsersNumber().subscribe(
        res => {
          this.length = res;
        },
        err => {
          console.log(err)
        }
      )
    }

  }

  rosterFull(){
    let roster = 0;
    if (this.teamInfo) {
      if (this.teamInfo.teamMembers) {
        roster += this.teamInfo.teamMembers.length;
        if (this.teamInfo.pendingMembers) {
          roster += this.teamInfo.pendingMembers.length;
        }
      }
    }
      return roster >= 9;
  }

  showInviteButton(player){
    if (this.teamInfo.invitedUsers && this.teamInfo.invitedUsers.indexOf(player.displayName) > -1) {
      return false;
    } else {
      return true;
    }
  }

  getNextPage(filter, page, showMsg) {
    console.log('filter ',filter)
    if(filter){
      this._userService.getFilteredUsersOfPageNum(page, showMsg).subscribe(
        res=>{
          this.displayArray = res;
        },err=>{
          console.log(err);
        }
      )
    }else{
      this._userService.getUsersOfPageNum(page, showMsg).subscribe(
        res => {
          this.displayArray = res;
        }, err => {
          console.log(err);
        }
      )
    }
  }

  resetRoles() {
    let keys = Object.keys(this.searchParameters.rolesNeeded);
    keys.forEach(key => {
      this.searchParameters.rolesNeeded[key] = false;
    })
  }

  requestToJoin(player){
    this.request.inviteToTeamRequest(this.auth.getTeam(), player.displayName).subscribe(
      (res)=>{
        this.teamInfo.invitedUsers.push(player.displayName);
        //filter by pending invites?
      },err=>{
        console.log(err);
      }
    )
  }


  selected(div) {
    this.searchParameters.divisions.push(div);
  }

}
