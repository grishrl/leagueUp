import { Component, OnInit, Input } from '@angular/core';
import { DivisionService } from '../services/division.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Team } from '../classes/team.class';
import { Division } from '../classes/division';
import { TeamService } from '../services/team.service';
import { environment } from '../../environments/environment';
import { TimeserviceService } from '../services/timeservice.service';



@Component({
  selector: 'app-division',
  templateUrl: './division.component.html',
  styleUrls: ['./division.component.css']
})

export class DivisionComponent implements OnInit {



  teams:Team[]
  divSub: Subscription
  param: string
  navigationSubscription
  divDisplay = new Division();
  teamAggregate = [];



  constructor(private division:DivisionService, private teamService:TeamService, private route:ActivatedRoute, private router: Router,
    private timeService:TimeserviceService) {


    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.param = this.route.snapshot.params['division'];
        this.initialise();
      }
    });

   }

   currentSeason;

   index=0;


   _passDivision;
  @Input() set passDivision(info) {
    console.log('xxx ', info);
    if (info != null && info != undefined) {
      this._passDivision = info;
    }
  }

  _passSeason;
  @Input() set passSeason(info) {
    console.log('past-division season', info);
    if (info != null && info != undefined) {
      this._passSeason = true;
      this.currentSeason = info;
    }
  }


  //this initialise shall be ran if the division component is loaded via a route; or in best estimation ... via current season loading a division...
  initialise(){
    this.divDisplay = new Division();
    this.timeService.getSesasonInfo().subscribe(res => {
      this.currentSeason = res['value'];
    });
    this.divSub = this.division.getDivision(this.param).subscribe((res) => {

      if(res!=undefined&&res!=null){
        this.divDisplay = res;
        if(this.divDisplay.cupDiv){
          this.teamAggregate = this.divDisplay.teams.concat(this.divDisplay.participants);
        }else{
          this.teamAggregate = this.divDisplay.teams
        }

      }
    }, (err)=>{

        });

  }

  ngOnInit() {
    if (this._passDivision){
      this.divDisplay = this._passDivision;
      if (this._passDivision.cupDiv) {
        this.teamAggregate = this._passDivision.teams.concat(this._passDivision.participants);
      } else {
        this.teamAggregate = this._passDivision.teams
      }
    }

  }

}
