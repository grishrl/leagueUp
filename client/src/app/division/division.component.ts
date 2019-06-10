import { Component, OnInit } from '@angular/core';
import { DivisionService } from '../services/division.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Team } from '../classes/team.class';
import { Division } from '../classes/division';
import { TeamService } from '../services/team.service';
import { environment } from '../../environments/environment';



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

  season = environment.season;

  constructor(private division:DivisionService, private teamService:TeamService, private route:ActivatedRoute, private router: Router) {


    this.navigationSubscription = this.router.events.subscribe((e: any) => {

      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.param = this.route.snapshot.params['division'];
        this.initialise();
      }
    });

   }

   index=0;

  initialise(){
    this.divDisplay;
    this.teams = [];
    this.divSub = this.division.getDivision(this.param).subscribe((res) => {

      if(res!=undefined&&res!=null){
        this.divDisplay = res;
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
