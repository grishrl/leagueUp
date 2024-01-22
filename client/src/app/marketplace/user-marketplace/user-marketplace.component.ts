import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/services/auth.service';
import { TimezoneService } from 'src/app/services/timezone.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';
import { RequestService } from 'src/app/services/request.service';
import { DivisionService } from 'src/app/services/division.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: "app-user-marketplace",
  templateUrl: "./user-marketplace.component.html",
  styleUrls: ["./user-marketplace.component.css"],
})
export class UserMarketplaceComponent implements OnInit {
  constructor(
    private divisionService: DivisionService,
    private auth: AuthService,
    public _userService: UserService,
    public timezone: TimezoneService,
    private util: UtilitiesService,
    public _team: TeamService,
    private request: RequestService
  ) {}

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  availability = {
    monday: {
      available: false,
      startTime: null,
      endTime: null,
    },
    tuesday: {
      available: false,
      startTime: null,
      endTime: null,
    },
    wednesday: {
      available: false,
      startTime: null,
      endTime: null,
    },
    thursday: {
      available: false,
      startTime: null,
      endTime: null,
    },
    friday: {
      available: false,
      startTime: null,
      endTime: null,
    },
    saturday: {
      available: false,
      startTime: null,
      endTime: null,
    },
    sunday: {
      available: false,
      startTime: null,
      endTime: null,
    },
  };

  localResults = [];
  divisions = [];
  hasSearched = false;
  hlDivision = [1, 2, 3, 4, 5];
  competitonLevel = [
    { val: 1, display: "Low" },
    { val: 3, display: "Medium" },
    { val: 5, display: "High" },
  ];
  hlMedals = [
    "Grand Master",
    "Master",
    "Diamond",
    "Platinum",
    "Gold",
    "Silver",
    "Bronze",
    "Unranked",
  ];
  selectedDivision;
  showSearch = false;
  searchParameters = {
    divisions: [],
    lowerMMR: null,
    upperMMR: null,
    competitiveLevel: null,
    rolesNeeded: {
      tank: false,
      meleeassassin: false,
      rangedassassin: false,
      support: false,
      offlane: false,
      flex: false,
    },
    customTime: null,
    customtimeZone: null,
    customAvail: Object.assign({}, this.availability),
    timezone: null,
  };

  // showInviteButton = false;

  filterName: string = "";
  displayArray = [];
  length: number;
  pageSize: number = 10;
  filteredArray: any = [];

  pageEvent: PageEvent;

  pageEventHandler(pageEvent: PageEvent) {
    let i = pageEvent.pageIndex;
    if (this.localResults.length > 0) {
      i = i * this.pageSize;
      let endSlice = i + this.pageSize;
      if (endSlice > this.localResults.length) {
        endSlice = this.localResults.length;
      }
      this.displayArray = [];
      this.displayArray = this.localResults.slice(i, endSlice);
    } else {
      this.getNextPage(this.getFiltered, i, true);
    }
  }

  search() {
    let postObj = {};

    let keys = Object.keys(this.searchParameters);
    keys.forEach((key) => {
      if (
        key != "divisions" &&
        key != "customTime" &&
        key != "rolesNeeded" &&
        key != "customAvail" &&
        key != "customtimeZone" &&
        key != "timezone" &&
        this.searchParameters[key] != null
      ) {
        postObj[key] = this.searchParameters[key];
      } else if (key == "divisions" && this.searchParameters[key].length > 0) {
        postObj[key] = this.searchParameters[key];
      } else if (this.searchParameters[key] != null && key == "customTime") {
        if (this.searchParameters[key] == "profile") {
          postObj["times"] = this.customTimeValidator(
            this.teamInfo.availability
          );
        }
        let cleanTime = this.customTimeValidator(
          this.searchParameters["customAvail"]
        );
        if (cleanTime != null) {
          postObj["times"] = cleanTime;
        }
      } else if (this.searchParameters[key] != null && key == "rolesNeeded") {
        let roles = this.searchParameters[key];
        let roleKeys = Object.keys(this.searchParameters[key]);
        roleKeys.forEach((role) => {
          if (roles[role]) {
            if (
              postObj["rolesNeeded"] == null ||
              postObj["rolesNeeded"] == undefined
            ) {
              postObj["rolesNeeded"] = {};
            }
            postObj["rolesNeeded"][role] = roles[role];
          }
        });
      } else if (this.searchParameters[key] != null && key == "timezone") {
        if (this.searchParameters[key] == "profile") {
          postObj["getProfileTimezone"] = true;
        } else {
          postObj["timezone"] = this.searchParameters["customtimeZone"];
        }
      }
    });
    this._userService.userMarketSearch(postObj).subscribe(
      (res) => {
        this.localResults = res;
        this.displayArray = res.slice(0, 10);
        this.length = res.length;
        this.hasSearched = true;
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  clear() {
    this.showSearch = !this.showSearch;
    this.hasSearched = false;
    this.localResults = [];
    this.getNextPage(this.getFiltered, 0, true);
    this.getAllUsers(this.getFiltered);
    this.paginator.firstPage();
  }

  teamInfo;

  getFiltered = false;

  ngOnInit() {
    //gets division list
    this.divisionService.getDivisionInfo().subscribe(
      (res) => {
        this.divisions = res;
      },
      (err) => {
        console.warn(err);
      }
    );

    if (this.auth.getTeam()) {
      this._team.getTeam(this.auth.getTeam()).subscribe(
        (res) => {
          this.teamInfo = res;
        },
        (err) => {
          console.warn(err);
        }
      );
    }

    this.getFiltered = this.auth.getCaptain() == "true";

    this.getAllUsers(this.getFiltered);
    this.getNextPage(this.getFiltered, 0, false);
  }

  getAllUsers(filter) {
    if (filter) {
      this._userService.getFilteredUsersNumber().subscribe(
        (res) => {
          this.length = res;
        },
        (err) => {
          console.warn(err);
        }
      );
    } else {
      this._userService.getFilteredUsersNumber().subscribe(
        (res) => {
          this.length = res;
        },
        (err) => {
          console.warn(err);
        }
      );
    }
  }

  rosterFull() {
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

  getNextPage(filter, page, showMsg) {
    if (filter) {
      this._userService.getFilteredUsersOfPageNum(page, showMsg).subscribe(
        (res) => {
          this.displayArray = res;
        },
        (err) => {
          console.warn(err);
        }
      );
    } else {
      this._userService.getFilteredUsersOfPageNum(page, showMsg).subscribe(
        (res) => {
          this.displayArray = res;
        },
        (err) => {
          console.warn(err);
        }
      );
    }
  }

  resetMMRS() {
    this.searchParameters.lowerMMR = null;
    this.searchParameters.upperMMR = null;
  }

  resetRoles() {
    let keys = Object.keys(this.searchParameters.rolesNeeded);
    keys.forEach((key) => {
      this.searchParameters.rolesNeeded[key] = false;
    });
  }

  filterSelected() {
    let divs = [];

    this.hlMedals.forEach((element) => {
      let push = true;
      this.searchParameters.divisions.forEach((selDiv) => {
        if (element == selDiv) {
          push = false;
        }
      });
      if (push) {
        divs.push(element);
      }
    });
    return divs;
  }

  selected(div) {
    this.searchParameters.divisions.push(div);
  }

  customTimeValidator(customTime) {
    let days = Object.keys(customTime);
    let retObj = {};
    days.forEach((day) => {
      if (customTime[day].available) {
        if (
          (customTime[day].startTime != null ||
            customTime[day].startTime != undefined) &&
          (customTime[day].endTime != null ||
            customTime[day].endTime != undefined)
        ) {
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
