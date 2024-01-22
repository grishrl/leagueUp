import { Component, OnInit, Input } from '@angular/core';
import { DivisionService } from '../../services/division.service';
import { type } from 'os';
import { UtilitiesService } from '../../services/utilities.service';

@Component({
  selector: 'app-division-if-public',
  templateUrl: './division-if-public.component.html',
  styleUrls: ['./division-if-public.component.css']
})
export class DivisionIfPublicComponent implements OnInit {

  constructor(private divisionServ:DivisionService, private util:UtilitiesService) { }

  divisionDisplayName:string = '';
  @Input() set divisionInfo(val){
    if(val){
      if (typeof val == 'object') {
        this.handleDivObject(val);
      }else{
        this.initDivision(val);
      }



    }else{
      this.divisionDisplayName = '';
    }
  }

  initDivision(divName){
    this.divisionServ.getDivision(divName).subscribe(
      res=>{
        this.handleDivObject(res);
      },
      err=>{

      }
    )
  }

  ngOnInit() {
  }

  handleDivObject(val){
    if (typeof val == 'object') {
      if (this.util.returnBoolByPath(val, 'public') && this.util.returnBoolByPath(val, 'displayName')) {
        if (val.public) {
          this.divisionDisplayName = val.displayName;
        } else {
          this.divisionDisplayName = '';
        }
      } else {
        this.divisionDisplayName = '';
      }
    }
  }

}
