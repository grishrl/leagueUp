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

  showInviteButton = false;

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
      this._team.getTeamsOfPageNum(i, true).subscribe(res => {
        this.displayArray = res;
      }, err => {
        console.log(err);
      })
    }


  }

  clear() {
    this.showSearch = !this.showSearch;
    this.hasSearched = false;
    this.localResults = [];
    this.getNextPage(0, true);
  }

  teamInfo;

  ngOnInit() {
    //gets division list
    this.divisionService.getDivisionInfo().subscribe((res) => {
      this.divisions = res;
    }, (err) => {
      console.log(err);
    });
    // this._team.checkCanInvite().subscribe(
    //   res => {
    //     this.showInviteButton = res;
    //   },
    //   err => {
    //     console.log(err);
    //   }
    // )
    this._team.getTeam(this.auth.getTeam()).subscribe((res)=>{
      this.teamInfo = res;
    },(err)=>{  
      console.log(err);
    })
    this.getAllUsers();
    this.getNextPage(0,false);
  }

  getAllUsers() {
    this._userService.getUsersNumber().subscribe(
      res => {
        this.length = res;
      },
      err => {
        console.log(err)
      }
    )
  }

  getNextPage(page, showMsg) {
    this._userService.getUsersOfPageNum(page, showMsg).subscribe(
      res => {
        this.displayArray = res;
      }, err => {
        console.log(err);
      }
    )
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
