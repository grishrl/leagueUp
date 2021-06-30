import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { DivisionService } from '../services/division.service';
import { AdminService } from '../services/admin.service';
import { UtilitiesService } from '../services/utilities.service';

@Component({
  selector: 'app-division-selector',
  templateUrl: './division-selector.component.html',
  styleUrls: ['./division-selector.component.css']
})
export class DivisionSelectorComponent implements OnInit {

  constructor(private DivisionService:DivisionService, private Admin:AdminService, private util:UtilitiesService) { }

  divisions=[];
  selectedDivision = null;


  ngOnInit() {
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
    if(_admin!=null||_admin!=undefined){
      this.adminLoad = !!_admin;
    }
  }

  @Input() set refresh(val){
    this.ngOnInit();
  }

  @Input() set inputDiv(div){
    if(div){
      this.selectedDivision=div._id;
    }else{
      this.selectedDivision = null;
    }
  }

  @Output() selectedDiv = new EventEmitter();

  divEmmiter(div) {
    this.selectedDiv.emit(div);
  }

  returnMatchDivision(prop, value){
    let div = null;
    this.divisions.forEach(division=>{
      if(division[prop]==value){
        div = division;
      }
    })
    return div;
  }

divSelected(div){
  this.divEmmiter(this.returnMatchDivision('_id', div));
}

}
