import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { StandingsService } from 'src/app/services/standings.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatPaginator, PageEvent } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: "app-tournament-generator",
  templateUrl: "./tournament-generator.component.html",
  styleUrls: ["./tournament-generator.component.css"],
})
export class TournamentGeneratorComponent implements OnInit {
  selectFromList: AnalyserNode;
  selectedList: any;

  divisions: any = [];
  selectedDivision: any = null;
  division;
  constructor(
    private adminService: AdminService,
    private standingsService: StandingsService,
    private admin: AdminService,
    private team: TeamService
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
        console.log(err);
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
        console.log(err);
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
        console.log(err);
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
    if (this.tournamentSeed.length > 3) {
      if ((this.showAll && this.name != null) || this.name != undefined) {
        disable = false;
      } else {
        if (this.season) {
          disable = false;
        }
      }
      if (this.tournName.invalid) {
        disable = true;
      }
    }
    return disable;
  }

  generateBrackets() {
    // console.log(this.tournamentSeed, this.season, this.name, this.division, this.cup, this.description);
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
          console.log(err);
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
        console.log(err);
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
