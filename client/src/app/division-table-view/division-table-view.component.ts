import { Component, OnInit } from '@angular/core';
import { DivisionService } from '../services/division.service';

@Component({
  selector: 'app-division-table-view',
  templateUrl: './division-table-view.component.html',
  styleUrls: ['./division-table-view.component.css']
})
export class DivisionTableViewComponent implements OnInit {

  constructor(private divisionService:DivisionService) { }

  rowArray = [];
  ngOnInit() {
    this.divisionService.getDivisionInfo().subscribe(res => {
      console.log(res);
      let columnArray = [];
      res.forEach( (item, iterator)=>{
        console.log(iterator)
        if(iterator%4==0 && iterator != 0){
          this.rowArray.push(columnArray);
          columnArray = [];
          columnArray.push(item);
        }else if(iterator == res.length-1){
          columnArray.push(item);
          this.rowArray.push(columnArray);
        }else{
          columnArray.push(item);
        }
      } );
      console.log(this.rowArray);
    }, err => {
      console.log(err);
    });
  }

}
