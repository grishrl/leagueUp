import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { StandingsService } from 'src/app/services/standings.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatPaginator, PageEvent } from '@angular/material';

@Component({
  selector: 'app-tournament-generator',
  templateUrl: './tournament-generator.component.html',
  styleUrls: ['./tournament-generator.component.css']
})
export class TournamentGeneratorComponent implements OnInit {

  divisions: any = [];
  selectedDivision: any = null;
  division
  constructor(private adminService:AdminService, private standingsService:StandingsService, private admin:AdminService) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  selected(div) {
    if(div!=undefined){
      this.tournamentSeed = [];
      this.standings = [];
      this.showAll = false;
      this.division = div.divisionConcat;
      this.getStandings(div.divisionConcat);
    }else{
      this.tournamentSeed = [];
      this.standings = [];
      this.showAll = false;
    }

  }

  name:string;
  season:string;
  fetching=false;

  standings:any=[];
  filterName: string = '';
  displayArray = [];
  length: number;
  pageSize: number = 10;
  filteredArray: any = [];

  getStandings(div) {
    this.fetching = true;
    this.standingsService.getStandings(div).subscribe(
      (res) => {
        this.fetching = false;
        console.log(res);
        this.standings = res;
      },
      (err) => {
        this.fetching = false;
        console.log(err);
      }
    )
  }
  showAll=false;
  allTeams = [];
  revealAllTeams(){
    this.tournamentSeed = [];
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
    )
    this.showAll=!this.showAll;
  }

  selectedFromList(team){
    this.tournamentSeed.push(team);
  }

  pageEventHandler(pageEvent: PageEvent) {
    let i = pageEvent.pageIndex * this.pageSize;
    let endSlice = i + this.pageSize
    if (endSlice > this.filteredArray.length) {
      endSlice = this.filteredArray.length;
    }
    this.displayArray = [];
    this.displayArray = this.filteredArray.slice(i, endSlice)

  } 

  disableGenerate(){
    let disable = true;
    if(this.tournamentSeed.length>3){
      if(this.showAll && this.name!=null||this.name!=undefined){
        disable = false;
      } else {
        if(this.season){
          disable = false;
        }
      }
    }
    return disable;
  }

  generateBrackets(){
    this.adminService.generateTournament(this.tournamentSeed, this.season, this.name, this.division).subscribe(
      res=>{
        this.ngOnInit();
      },
      err=>{
        console.log(err);
      }
    )
  }

  ngOnInit() {
    this.standings = [];
    this.adminService.getDivisionList().subscribe((res) => {
      this.divisions = res;
    }, (err) => {
      console.log(err);
    });
    this.showAll =false;
    this.season = null;
    this.division=null;
    this.name = null;
    this.tournamentSeed = [];
    
  }


  tournamentSeed = [

  ];

  teamInd(arr, team) {
    let ind = -1;
    arr.forEach((element, index) => {
      if (team.teamName == element.teamName) {
        ind = index;
      }
    });
    return ind;
  }

  remove(item){
    this.tournamentSeed.splice(this.teamInd(this.tournamentSeed, item), 1);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

}
