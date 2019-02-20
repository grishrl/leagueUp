import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { DivisionService } from '../services/division.service';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-division-selector',
  templateUrl: './division-selector.component.html',
  styleUrls: ['./division-selector.component.css']
})
export class DivisionSelectorComponent implements OnInit {

  constructor(private DivisionService:DivisionService, private Admin:AdminService) { }

  divisions=[];
  selectedDivision;


  ngOnInit() {
    //gets division list
    console.log(this.adminLoad);
    if(this.adminLoad){
      this.Admin.getDivisionList().subscribe((res) => {
        this.divisions = res;
      }, (err) => {
        console.log(err);
      })
    }else{
      this.DivisionService.getDivisionInfo().subscribe((res) => {
        this.divisions = res;
      }, (err) => {
        console.log(err);
      })
    }

  }


  adminLoad=false;
  @Input() set admin(_admin){
    console.log('_admin ',_admin)
    if(_admin!=null||_admin!=undefined){
      this.adminLoad = !!_admin;
    }
  }

  @Output() selectedDiv = new EventEmitter();

  divEmmiter(div) {
    this.selectedDiv.emit(div);
  }


  //division selected from dropdown, creates a safe source to cancel back to
  selected(div) {
    this.divEmmiter(div);
  }

}
