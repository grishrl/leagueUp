import { Component, OnInit } from '@angular/core';


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
