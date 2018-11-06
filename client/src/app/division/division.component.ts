import { Component, OnInit } from '@angular/core';
import { DivisionService } from '../services/division.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Team } from '../classes/team.class';



@Component({
  selector: 'app-division',
  templateUrl: './division.component.html',
  styleUrls: ['./division.component.css']
})
export class DivisionComponent implements OnInit {
  div:String
  coast:String
  teams:Team[]
  divSub: Subscription
  param: String
  navigationSubscription
  divDisplay: String
  coastDisplay: String


  constructor(private division:DivisionService, private route:ActivatedRoute, private router: Router) {

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initialise();
      }
    });

   }
  
  initialise(){
    this.div = this.route.snapshot.params['division'];
    this.coast = this.route.snapshot.params['coast'];
    //convoluted way to pretty up our div displays:
    if(this.div){
      this.divDisplay = this.div;
      let char = this.divDisplay.charAt(0);
      let capChar = char.toUpperCase();
      this.divDisplay=this.divDisplay.replace(char,capChar);
    }
    if(this.coast){
      this.coastDisplay = this.coast;
      let char = this.coast.charAt(0);
      let capChar = char.toUpperCase();
      this.coastDisplay=this.coastDisplay.replace(char, capChar);
    }

    this.divSub = this.division.getDivision(this.div, this.coast).subscribe((res) => {
      this.teams = <[Team]>res;
    }, (err)=>{
      var arr : Team[] = [];
      this.teams = arr; 
        });
  
      }

  ngOnInit() {
    
  }

}
