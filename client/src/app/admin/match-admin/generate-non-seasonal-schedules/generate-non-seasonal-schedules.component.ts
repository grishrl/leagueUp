import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AdminService } from 'src/app/services/admin.service';
import { StandingsService } from 'src/app/services/standings.service';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: "app-generate-non-seasonal-schedules",
  templateUrl: "./generate-non-seasonal-schedules.component.html",
  styleUrls: ["./generate-non-seasonal-schedules.component.css"],
})
export class GenerateNonSeasonalSchedulesComponent implements OnInit {
  constructor(
    private adminService: AdminService,
    private standingsService: StandingsService,
    private admin: AdminService,
    private team: TeamService,
    private utils: UtilitiesService
  ) {}

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  showCups = false;

  name: string;
  description: string;
  season: string;
  cup;

  fetching = false;

  tournTypes = [
    {
      type: "single elimination",
      display: "Single Elim",
    },
    {
      type: "double elimination",
      display: "Double Elim",
    },
  ];

  eventType;
  selectedType = this.tournTypes[0].type;
  standings: any = [];
  filterName: string = "";
  displayArray = [];
  length: number;
  pageSize: number = 10;
  filteredArray: any = [];
  showAll = false;
  allTeams = [];
  tournamentSeed = [];

  tournName = new FormControl("", [
    Validators.pattern("^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$"),
  ]);

  ngOnInit(): void {}

  revealAllTeams() {
    this.standings = [];
    this.fetching = true;
    this.admin.getTeams().subscribe(
      (res) => {
        this.fetching = false;
        this.allTeams = res;
        this.filteredArray = this.allTeams;
        this.length = this.filteredArray.length;
        this.displayArray = this.allTeams.slice(0, 10);
      },
      (err) => {
        this.fetching = false;
        console.warn(err);
      }
    );
    this.showAll = !this.showAll;
  }

  selectedFromList(team) {
    this.tournamentSeed.push(team);
    let ind = this.teamInd(this.displayArray, team);
    this.displayArray.splice(ind, 1);
  }

  remove(item) {
    let removedTeam = this.tournamentSeed.splice(
      this.teamInd(this.tournamentSeed, item),
      1
    );
    this.filterTeams(null);
  }

  reset() {
    this.tournamentSeed = [];
    this.standings = [];
    this.showAll = false;
    this.season = null;
    this.name = null;
    this.description = null;
    this.cup = null;
    this.showCups = false;
  }

  filterTeams(filterName) {
    if (
      filterName != null &&
      filterName != undefined &&
      filterName.length != 0
    ) {
      this.filteredArray = [];
      this.allTeams.forEach((element) => {
        if (
          element.teamName_lower
            .toLowerCase()
            .indexOf(filterName.toLowerCase()) > -1
        ) {
          this.filteredArray.push(element);
        }
      });
    } else {
      this.filteredArray = this.allTeams.slice();
    }

    this.filteredArray.forEach((filterEle, indexA) => {
      let teamIndex = -1;
      this.tournamentSeed.forEach((tournListEle, indexB) => {
        if (tournListEle.teamName_lower == filterEle.teamName_lower) {
          teamIndex = indexA;
        }
      });
      if (teamIndex > -1) {
        this.filteredArray.splice(teamIndex, 1);
      }
    });

    this.length = this.filteredArray.length;
    this.displayArray = this.filteredArray.slice(0, 10);
    this.paginator.firstPage();
  }

  pageEventHandler(pageEvent: PageEvent) {
    let i = pageEvent.pageIndex * this.pageSize;
    let endSlice = i + this.pageSize;
    if (endSlice > this.filteredArray.length) {
      endSlice = this.filteredArray.length;
    }
    this.displayArray = [];
    this.displayArray = this.filteredArray.slice(i, endSlice);
  }

  disableGenerate() {
    let disable = true;
    if (
      this.tournamentSeed.length > 3 &&
      this.eventType &&
      !this.utils.isNullOrEmpty(this.name) &&
      this.tournName.valid
    ) {
      disable = false;
    }
    return disable;
  }

  teamInd(arr, team) {
    let ind = -1;
    arr.forEach((element, index) => {
      if (team.teamName == element.teamName) {
        ind = index;
      }
    });
    return ind;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  typeSelected(type){


    // something will go here eventually

    console.log(type);

  };

  generateBrackets() {
    console.log("you clicked it");

    if (this.eventType == "roundrobin") {
    } else if (this.eventType == "tournament") {
      //   this.adminService
      //     .generateTournament(
      //       this.tournamentSeed,
      //       this.season,
      //       this.name,
      //       null,
      //       null,
      //       this.description,
      //       this.selectedType
      //     )
      //     .subscribe(
      //       (res) => {
      //         this.ngOnInit();
      //       },
      //       (err) => {
      //         console.warn(err);
      //       }
      //     );
    } else {
      alert("How'd you do this?");
    }
    // if(this.divisional){
    //   this.adminService
    //     .generateTournament(
    //       this.tournamentSeed,
    //       this.season,
    //       this.name,
    //       this.division,
    //       this.cup,
    //       this.description,
    //       this.selectedType
    //     )
    //     .subscribe(
    //       (res) => {
    //         this.ngOnInit();
    //       },
    //       (err) => {
    //         console.warn(err);
    //       }
    //     );
    //   }

    // if(!this.divisional){
    //   this.adminService
    //     .generateTournament(
    //       this.tournamentSeed,
    //       this.season,
    //       this.name,
    //       null,
    //       null,
    //       this.description,
    //       this.selectedType
    //     )
    //     .subscribe(
    //       (res) => {
    //         this.ngOnInit();
    //       },
    //       (err) => {
    //         console.warn(err);
    //       }
    //     );
    // }
  }
}
