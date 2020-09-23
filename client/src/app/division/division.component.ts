import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { DivisionService } from '../services/division.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Team } from '../classes/team.class';
import { Division } from '../classes/division';
import { TeamService } from '../services/team.service';
import { TimeserviceService } from '../services/timeservice.service';
import { TabTrackerService } from '../services/tab-tracker.service';
import { environment } from "../../environments/environment";



@Component({
  selector: 'app-division',
  templateUrl: './division.component.html',
  styleUrls: ['./division.component.css']
})

export class DivisionComponent implements OnInit, OnChanges {



  teams:Team[]
  divSub: Subscription
  param: string
  navigationSubscription
  divDisplay = new Division();
  teamAggregate = [];
  divisionImage;



  constructor(private division:DivisionService, private teamService:TeamService, private route:ActivatedRoute, private router: Router,
    private timeService:TimeserviceService, private tabTacker:TabTrackerService) {


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

   setTab(ind){
     this.tabTacker.lastRoute = 'division';
     this.tabTacker.lastTab = ind;
     this.index = ind;
   }


   _passDivision;
  @Input() set passDivision(info) {
    if (info != null && info != undefined) {
      this._passDivision = info;
    }
  }

  _passSeason;
  passSeasonVal;
  @Input() set passSeason(info) {
    if (info != null && info != undefined) {
      this._passSeason = true;
      this.passSeasonVal = info;
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.hasOwnProperty('passDivision')) {
      let currentDivConcat = changes.passDivision.currentValue ? changes.passDivision.currentValue : null;
      let previousDivConcat = changes.passDivision.previousValue ? changes.passDivision.previousValue : null;
      if (currentDivConcat != null && currentDivConcat != previousDivConcat && this._passSeason) {
        this.ngOnInit();
      }
    }
    if (changes.hasOwnProperty('passSeason')) {
      let currentSea = changes.passSeason.currentValue ? changes.passSeason.currentValue : null;
      let previousSea = changes.passSeason.previousValue ? changes.passSeason.previousValue : null;
      if (currentSea != null && currentSea != previousSea && this._passDivision) {
        this.ngOnInit();
      }
    }

  }


  //this initialise shall be ran if the division component is loaded via a route; or in best estimation ... via current season loading a division...
  initialise(){
    this.teamAggregate=[];
    this.divDisplay = new Division();
    this.timeService.getSesasonInfo().subscribe(res => {
      this.currentSeason = res['value'];
    });
    this.divSub = this.division.getDivision(this.param).subscribe((res) => {
      if(res!=undefined&&res!=null){
        this.divDisplay = res;
        this.divisionImage = `${environment.awsTld}/${environment.s3bucketGeneralImage}/divimg/${this.divDisplay.divisionConcat}.png`;
        if(this.divDisplay.cupDiv){
          this.teamAggregate = this.divDisplay.teams.concat(this.divDisplay.participants);
        }else{
          this.teamAggregate = this.divDisplay.teams
        }
        this.index = this.tabTacker.returnTabIndexIfSameRoute('division');
      }
    }, (err)=>{

        });

  }

  ngOnInit() {
    this.teamAggregate = [];
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
