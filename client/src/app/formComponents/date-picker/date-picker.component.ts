import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { type } from 'os';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit {

  constructor(private util:UtilitiesService) { }

  friendlyDate

  @Input() set inDate(val){

  }

  dateValue;


  @Output()
  dateValueChange = new EventEmitter();

  @Input()
  get date() {
    return this.dateValue;
  }

  set date(val) {
    if (typeof val == 'string') {
      val = parseInt(val);
      this.dateValue = val;
      let tempD = new Date(val);
      this.friendlyDate = tempD;
    }else if(typeof val == 'number'){
      let tempD = new Date(val);
      this.dateValue = val;
      this.friendlyDate = tempD;
    }

    this.dateValueChange.emit(this.dateValue);
  }

  ngOnInit() {
  }

  updateDate(){
    if (this.friendlyDate) {
      let years = this.friendlyDate.getFullYear();
      let month = this.friendlyDate.getMonth();
      let day = this.friendlyDate.getDate();
      let setDate = new Date();
      setDate.setFullYear(years);
      setDate.setMonth(month);
      setDate.setDate(day);
      setDate.setHours(0,0,0,0);
      let msDate = setDate.getTime();
      this.dateValue = msDate;
      // this.outDateActioner(msDate);

    }
  }
}
