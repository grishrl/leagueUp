import { Component, OnInit } from '@angular/core';
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

    this.timeService.getSesasonInfo().subscribe(res => {
      this.currentSeason = res['value'];
    });
    this.timeService.getSesasonInfo();

   }
   currentSeason;

  season = this.currentSeason;

   index=0;

  initialise(){
    this.divDisplay;
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

  ngOnInit() {
    this.initialise();
  }

}
