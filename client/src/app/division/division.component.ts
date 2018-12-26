import { Component, OnInit } from '@angular/core';
import { DivisionService } from '../services/division.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Team } from '../classes/team.class';
import { TeamService } from '../services/team.service';



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
  divDisplay = {displayName:''};

  

  constructor(private division:DivisionService, private teamService:TeamService, private route:ActivatedRoute, private router: Router) {
    

    this.navigationSubscription = this.router.events.subscribe((e: any) => {

      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.param = this.route.snapshot.params['division'];
        this.initialise();
      }
    });

   }
  
  initialise(){
    this.divDisplay;
    this.teams = [];
    this.divSub = this.division.getDivision(this.param).subscribe((res) => {

      if(res!=undefined&&res!=null){
        this.divDisplay = res;

        if (res.teams && res.teams.length > 0) {
          this.teamService.getTeams(res.teams).subscribe((retn) => {
            this.teams = retn;
          }, (error) => {
            console.log(error);
          });
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
