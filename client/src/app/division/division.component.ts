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
      console.log('x')
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.param = this.route.snapshot.params['division'];
        this.initialise();
      }
    });

    this.timeService.getSesasonInfo().subscribe(res => {
      this.currentSeason = res['value'];
    });

   }

   currentSeason;

   index=0;


   _division;
  @Input() set passDivision(info) {
    console.log('xxx ', info);
    if (info != null && info != undefined) {
      this._division = info;

      this.directiveInitialise();
    }
  }


  //this initialise shall be ran if the division component is loaded via a route; or in best estimation ... via current season loading a division...
  initialise(){
    this.divDisplay = new Division();
    this.teams = [];
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
      var arr : Team[] = [];
      this.teams = arr;
        });

  }

//this initialise shall be ran if the division component is loaded via a directive; or in best estimation ... via past season loading a division...
directiveInitialise(){
  this.divDisplay = new Division();
  this.teams = [];
  this.divDisplay = this._division;
  this.teamAggregate = this._division.teams;
}

  ngOnInit() {
    console.log('y')
    if (this._division){

    }else{
      console.log('z')
      this.initialise();
    }

  }

}
