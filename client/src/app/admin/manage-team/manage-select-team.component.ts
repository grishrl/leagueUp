import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { TeamService } from '../../services/team.service';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import { PageEvent, MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-manage-select-team',
  templateUrl: './manage-select-team.component.html',
  styleUrls: ['./manage-select-team.component.css']
})
export class ManageSelectTeamComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(private admin: AdminService, private team: TeamService, private router:Router) { }

  //component properties
  recievedProfile
  turnOnForm: boolean = false;
  pulledProfile:any
  teams:any[]=[];

  users: any = [];
  filterName: string = '';
  displayArray = [];
  length: number;
  pageSize: number = 10;
  filteredArray: any = [];

  ngAfterViewInit() {
    this.paginator.pageIndex = 0;
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

  //callback function that is passed to the search component, accepts the profile selected from that component
  //santaizes the returned profile for URL and routes to that profile
  receiveTeam(teamProf) {
    if (teamProf != null && teamProf != undefined) {
      this.goView(this.team.routeFriendlyTeamName(teamProf.teamName_lower));
    }
  }

  filterTeams(filterName) {
    if (filterName == null || filterName == undefined || filterName.length == 0) {
      this.filteredArray = this.teams;
      this.length = this.filteredArray.length;
      this.displayArray = this.filteredArray.slice(0, 10);
      this.paginator.firstPage();
    } else {
      this.filteredArray = [];
      this.teams.forEach(element => {
        if (element.teamName_lower.toLowerCase().indexOf(filterName.toLowerCase()) > -1) {
          this.filteredArray.push(element);
        }
      });
      this.length = this.filteredArray.length;
      this.displayArray = this.filteredArray.slice(0, 10);
      this.paginator.firstPage();
    }
  }

  //function tied to the list of teams, accepts team in scope,
  //sanatizes the team name and routes to the proper endpoint
  selectedFromList(prof){
    this.goView(this.team.routeFriendlyTeamName(prof.teamName_lower));
  }

  //takes id and routes to the manageTeam of id
  goView(id){
    this.router.navigate(['_admin/manageTeam/', id]);
  }

  ngOnInit() {
    //returns the teams for displaying in list.
    this.admin.getTeams().subscribe(
      (res)=>{
        this.teams = res;
        this.filteredArray = this.teams;
        this.length = this.filteredArray.length;
        this.displayArray = this.teams.slice(0,10);
      },
      (err)=>{
        console.log(err);
      }
    )
  }

}
