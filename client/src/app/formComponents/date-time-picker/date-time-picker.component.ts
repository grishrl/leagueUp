import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import * as moment from 'moment-timezone';

@Component({
  selector: "app-date-time-picker",
  templateUrl: "./date-time-picker.component.html",
  styleUrls: ["./date-time-picker.component.css"],
})
export class DateTimePickerComponent implements OnInit {
  constructor(private util:UtilitiesService) {}

  times: any[] = []; //local array that is populated progromatticaly to give users a drop down of times on 15 min interval to select
  selectedHourMin;
  selectedDate = '';
  suffix;
  amPm = ["PM", "AM"]; //local propery holds array for the am/pm dropdown

  selectedTimeValue: string;

  @Output()
  selectedTimeChange = new EventEmitter();

  @Input()
  get selectedTime() {
    return this.selectedTimeValue;
  }

  set selectedTime(val) {
    let intVal;
    let parse = false;
    if (val == null || val == undefined) {

    } else if (typeof val == "string") {
      intVal = parseInt(val);
      parse = true;
    } else if (typeof val == "number") {
      intVal = val;
      parse = true;
    }
    if(parse){
      this.selectedHourMin = this.util.getTimeFromMS(intVal);
      this.selectedDate = intVal;
      this.suffix = this.util.getSuffixFromMS(intVal);
    }
    this.selectedTimeValue = intVal;
    this.selectedTimeChange.emit(this.selectedTimeValue);
  }

  update() {
    this.selectedTimeChange.emit(this.selectedTimeValue);
  }

  ngOnInit(): void {
    //build out the selectable times for the user, in 15 min intervals
    for (let i = 1; i < 13; i++) {
      for (let j = 0; j <= 3; j++) {
        let min: any = j * 15;
        if (min == 0) {
          min = "00";
        }
        let time = i + ":" + min;
        this.times.push(time);
      }
    }
  }

  calculateTimeStamp(){
    if(this.selectedHourMin && this.selectedDate && this.suffix){
      let timeStamp = this.util.returnMSFromFriendlyDateTime(
        this.selectedDate,
        this.selectedHourMin,
        this.suffix
      );
      this.selectedTimeChange.emit(timeStamp);
    }
  }
}
