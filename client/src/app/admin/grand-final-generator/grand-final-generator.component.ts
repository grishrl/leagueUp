import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TeamService } from 'src/app/services/team.service';
import { Match } from '../../classes/match.class';
import { isThisTypeNode } from 'typescript';
import { AdminService } from 'src/app/services/admin.service';
import { MatPaginator } from '@angular/material';

@Component({
  selector: "app-grand-final-generator",
  templateUrl: "./grand-final-generator.component.html",
  styleUrls: ["./grand-final-generator.component.css"],
})
export class GrandFinalGeneratorComponent implements OnInit {
  constructor(private team: TeamService, private admin: AdminService) {}

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  fetching = false;
  showAll = false;
  filterName;
  length;
  pageSize = 10;
  teamDisplay = [];
  season;
  title;
  tournamentSeed = [];
  division;
  originalTeamsArray = [];
  casterName;
  casterUrl;
  startTime;

  finalMatch: Match = new Match();

  titleControl = new FormControl("", [
    Validators.pattern("^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$"),
  ]);

  pageEventHandler(event) {}

  filterTeams(filterName) {
    if (
      filterName == null ||
      filterName == undefined ||
      filterName.length == 0
    ) {
      this.teamDisplay = this.originalTeamsArray;
      this.length = this.teamDisplay.length;
      this.teamDisplay = this.originalTeamsArray.slice(0, 10);
      this.paginator.firstPage();
    } else {
      this.teamDisplay = [];
      this.originalTeamsArray.forEach((element) => {
        if (
          element.teamName_lower
            .toLowerCase()
            .indexOf(filterName.toLowerCase()) > -1
        ) {
          this.teamDisplay.push(element);
        }
      });
      this.length = this.teamDisplay.length;
      this.teamDisplay = this.teamDisplay.slice(0, 10);
      this.paginator.firstPage();
    }
  }

  selected(div) {
    if (div != undefined) {
      this.reset();

      this.division = div.divisionConcat;
      if (div.cupDiv) {
        this.getDivTeams(div);
      }
    } else {
      this.reset();
    }
  }

  checkTeamInvolvedInMatch(team, finalMatch) {
    console.log(team, finalMatch);
    if (team == finalMatch.home.teamName) {
      return "home";
    } else if (team == finalMatch.away.teamName) {
      return "away";
    } else {
      return null;
    }
  }

  assignTeam(team, position) {
    this.finalMatch[position].teamName = team.teamName;
    this.finalMatch[position].id = team._id;
    this.finalMatch[position].logo = team.logo;
    this.filterTeamDisplay();
  }

  getDivTeams(div) {
    this.fetching = true;
    this.team.getTeams(div.teams).subscribe(
      (res) => {
        this.fetching = false;

        this.originalTeamsArray = res;
        this.filterTeamDisplay();
      },
      (err) => {
        this.fetching = false;
        console.log(err);
      }
    );
  }

  filterTeamDisplay() {
    this.teamDisplay = this.originalTeamsArray.filter((teamItr) => {
      console.log(teamItr);
      if (
        teamItr.teamName == this.finalMatch.home.teamName ||
        teamItr.teamName == this.finalMatch.away.teamName
      ) {
        return false;
      }
      return true;
    });
    console.log(this.teamDisplay);
  }

  removeFromMatch(side) {
    this.finalMatch[side].teamName = "";
    this.finalMatch[side].id = "";
    this.filterTeamDisplay();
  }

  revealAllTeams() {
    this.originalTeamsArray = [];
    this.teamDisplay = [];
    this.fetching = true;
    this.admin.getTeams().subscribe(
      (res) => {
        this.fetching = false;
        this.originalTeamsArray = res;
        this.length = this.originalTeamsArray.length;
        this.teamDisplay = this.originalTeamsArray.slice(0, 10);
      },
      (err) => {
        this.fetching = false;
        console.log(err);
      }
    );
    this.showAll = true;
  }

  selectedFromList() {}

  teamInd(seed, team) {
    return -1;
  }

  reset() {
    this.finalMatch = new Match();
    this.ngOnInit();
  }

  disableGenerate() {
    if(this.finalMatch.home.teamName && this.finalMatch.away.teamName && this.finalMatch.season){
      return false;
    }else{
      return true;
    }
  }

  generate() {
    this.finalMatch.type = 'grandfinal';
    this.admin.createGrandFinal(this.finalMatch).subscribe(
      res=>{
        this.ngOnInit();
      },err=>{
        console.log(err);
      }
    )
  }

  ngOnInit(): void {
    this.finalMatch = new Match();
  }
}
