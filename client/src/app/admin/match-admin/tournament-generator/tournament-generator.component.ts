import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { StandingsService } from 'src/app/services/standings.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormControl, Validators } from '@angular/forms';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: "app-tournament-generator",
  templateUrl: "./tournament-generator.component.html",
  styleUrls: ["./tournament-generator.component.css"],
})
export class TournamentGeneratorComponent implements OnInit {
  selectFromList: any;
  selectedList: any;
  divisional:boolean = false;

  divisions: any = [];
  selectedDivision: any = null;
  division;
  constructor(
    private adminService: AdminService,
    private standingsService: StandingsService,
    private admin: AdminService,
    private team: TeamService,
    private utils: UtilitiesService
  ) {}

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

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

  selectedType = this.tournTypes[0].type;

  typeSelected(type){

  }

  selected(div) {
    if (div != undefined) {
      this.reset();

      this.division = div.divisionConcat;
      if (div.cupDiv) {
        this.showCups = true;
        this.getDivTeams(div);
      } else {
        this.getStandings(div.divisionConcat);
        this.showCups = false;
      }
    } else {
      this.reset();
    }
  }

  tournName = new FormControl("", [
    Validators.pattern("^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$"),
  ]);

  showCups = false;

  name: string;
  description: string;
  season: string;
  cup;

  fetching = false;

  standings: any = [];
  filterName: string = "";
  displayArray = [];
  length: number;
  pageSize: number = 10;
  filteredArray: any = [];

  getDivTeams(div) {
    this.fetching = true;
    this.team.getTeams(div.teams).subscribe(
      (res) => {
        this.fetching = false;

        this.standings = res;
      },
      (err) => {
        this.fetching = false;
        console.warn(err);
      }
    );
  }

  getStandings(div) {
    this.fetching = true;
    this.standingsService.getStandings(div).subscribe(
      (res) => {
        this.fetching = false;
        this.standings = res;
      },
      (err) => {
        this.fetching = false;
        console.warn(err);
      }
    );
  }
  showAll = false;
  allTeams = [];
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
  }

  reset() {
    this.tournamentSeed = [];
    this.standings = [];
    this.showAll = false;
    this.selectedDivision = null;
    this.division = null;
    this.divisional = false;
    this.season = null;
    this.name = null;
    this.description = null;
    this.cup = null;
    this.showCups = false;
  }

  filterTeams(filterName) {
    if (
      filterName == null ||
      filterName == undefined ||
      filterName.length == 0
    ) {
      this.filteredArray = this.allTeams;
      this.length = this.filteredArray.length;
      this.displayArray = this.filteredArray.slice(0, 10);
      this.paginator.firstPage();
    } else {
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
      this.length = this.filteredArray.length;
      this.displayArray = this.filteredArray.slice(0, 10);
      this.paginator.firstPage();
    }
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
      this.season &&
      !this.utils.isNullOrEmpty(this.name) &&
      this.tournName.valid
    ) {
      disable = false;
    }
    return disable;
  }

  generateBrackets() {

    if(this.divisional){
      this.adminService
        .generateTournament(
          this.tournamentSeed,
          this.season,
          this.name,
          this.division,
          this.cup,
          this.description,
          this.selectedType
        )
        .subscribe(
          (res) => {
            this.ngOnInit();
          },
          (err) => {
            console.warn(err);
          }
        );
      }

    if(!this.divisional){
      this.adminService
        .generateTournament(
          this.tournamentSeed,
          this.season,
          this.name,
          null,
          null,
          this.description,
          this.selectedType
        )
        .subscribe(
          (res) => {
            this.ngOnInit();
          },
          (err) => {
            console.warn(err);
          }
        );
    }
  }

  private gen(){
    this.adminService
      .generateTournament(
        this.tournamentSeed,
        this.season,
        this.name,
        this.division,
        this.cup,
        this.description,
        this.selectedType
      )
      .subscribe(
        (res) => {
          this.ngOnInit();
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  ngOnInit() {
    this.standings = [];
    this.adminService.getDivisionList().subscribe(
      (res) => {
        this.divisions = res;
      },
      (err) => {
        console.warn(err);
      }
    );
    this.showAll = false;
    this.season = null;
    this.division = null;
    this.name = null;
    this.tournamentSeed = [];
  }

  tournamentSeed = [];

  teamInd(arr, team) {
    let ind = -1;
    arr.forEach((element, index) => {
      if (team.teamName == element.teamName) {
        ind = index;
      }
    });
    return ind;
  }

  remove(item) {
    this.tournamentSeed.splice(this.teamInd(this.tournamentSeed, item), 1);
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
}
