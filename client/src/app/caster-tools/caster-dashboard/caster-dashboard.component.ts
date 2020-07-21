import { Component, OnInit } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { PageEvent, MatPaginator } from '@angular/material';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { AuthService } from 'src/app/services/auth.service';
import { FilterService } from 'src/app/services/filter.service';
import { TimeserviceService } from 'src/app/services/timeservice.service';
import * as moment from 'moment-timezone';


@Component({
  selector: 'app-caster-dashboard',
  templateUrl: './caster-dashboard.component.html',
  styleUrls: ['./caster-dashboard.component.css']
})
export class CasterDashboardComponent implements OnInit {

  index = 0;

  setTab(ind){
    this.index = ind;
  }

  constructor(){}

  ngOnInit(){

  }



}
