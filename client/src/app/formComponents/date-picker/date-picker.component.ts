import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import * as moment from 'moment-timezone';


@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit {

  constructor(private util:UtilitiesService) { }

  friendlyDate

  dateValue;


  @Output()
  dateChange = new EventEmitter();

  @Input()
  get date() {

    return this.dateValue;
  }

  set date(val) {

    if(val == null || val == undefined){

    }else if (typeof val == 'string') {
      val = parseInt(val);
      this.dateValue = val;
      let tempD = moment(val);
      this.friendlyDate = tempD;

    }else if(typeof val == 'number'){

      let tempD = moment(val);

      this.dateValue = val;
      this.friendlyDate = tempD;

    }

    this.dateChange.emit(this.dateValue);
  }

  update(){
    this.dateChange.emit(this.dateValue);
  }

  ngOnInit() {
  }

  updateDate(){

    if (this.friendlyDate) {
      let years = this.friendlyDate.year();
      let month = this.friendlyDate.month();

      let day = this.friendlyDate.date();

      let setDate = moment();
      setDate.year(years);
      setDate.month(month);
      setDate.date(day);
      setDate.hour(0).minute(0).second(0).millisecond(0);

      let msDate = setDate.unix()*1000;
      this.dateValue = msDate;
      this.dateChange.emit(this.dateValue);

    }
  }
}
