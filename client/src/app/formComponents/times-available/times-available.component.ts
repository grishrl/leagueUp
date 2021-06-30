import { Component, OnInit, Input, Output, EventEmitter, DoCheck } from '@angular/core';
import { UtilitiesService } from '../../services/utilities.service';
import { findIndex, forEach as _forEach } from 'lodash';

@Component({
  selector: 'app-times-available',
  templateUrl: './times-available.component.html',
  styleUrls: ['./times-available.component.css']
})
export class TimesAvailableComponent implements OnInit, DoCheck {


  daySelected:any = {
    "monday":'',
    "tuesday":'',
    "wednesday":'',
    "thursday":'',
    "friday":'',
    "saturday":'',
    "sunday":''
  }
  allDay:any = {
    "monday": '',
    "tuesday": '',
    "wednesday": '',
    "thursday": '',
    "friday": '',
    "saturday": '',
    "sunday": ''
  }

  show:boolean = false;
  availability = {
    "monday": {
      "available": false,
      "startTime": null,
      "endTime": null,
      "allDay":false
    },
    "tuesday": {
      "available": false,
      "startTime": null,
      "endTime": null,
      "allDay": false
    },
    "wednesday": {
      "available": false,
      "startTime": null,
      "endTime": null,
      "allDay": false
    }
    , "thursday": {
      "available": false,
      "startTime": null,
      "endTime": null,
      "allDay": false
    }
    , "friday": {
      "available": false,
      "startTime": null,
      "endTime": null,
      "allDay": false
    }
    , "saturday": {
      "available": false,
      "startTime": null,
      "endTime": null,
      "allDay": false
    }
    , "sunday": {
      "available": false,
      "startTime": null,
      "endTime": null,
      "allDay": false
    }
  };

  days=[
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ]

  populatedDays = [];

  errorAvail: boolean = false;
  errorReply: string = '';
  differ: any

  constructor(private util: UtilitiesService) {

  }

  ngOnInit() {

  }

  toggleAllDay(day, allDay){
    if(allDay){
      this.availability[day] = {
        available: true,
        startTime: '00:00',
        endTime: '23:45',
        allDay: true
      }
    }else{
      this.availability[day] = {
        available: false,
        startTime: null,
        endTime: null,
        allDay:false
      }
    }
  }

  fillFrom(targetDay, sourceDay) {
    this.availability[targetDay] = Object.assign({},this.availability[sourceDay]);
    this.recalculateCopyDays();
  }

  @Input() set availObj(_obj){
    if(typeof _obj == 'object' && _obj != null && _obj != undefined){
      this.availability = _obj;
      this.recalculateCopyDays();
    }
  }

  displayText: string ='Times the team plays and practices:';
  @Input() set customText(_text){
    if (typeof _text == 'string' && _text != null && _text != undefined){
      this.displayText = _text;
    }
  }

  local_disabled:boolean=false;
  @Input() set disabled(_disabled) {
    if (typeof _disabled == 'boolean' && _disabled != null && _disabled != undefined) {
      this.local_disabled = _disabled;
      this.recalculateCopyDays();
    }
  }

  recalculateCopyDays() {
    _forEach(this.availability, (value, key)=>{
      let ind = findIndex(this.populatedDays, function (o) {
        return o.value == key;
      });
      if (value.available && value.startTime && value.endTime) {
        let firstChar = key.charAt(0);
        firstChar = firstChar.toUpperCase();
        let prettyName = firstChar + key.substring(1, key.length);
        if (ind == -1) {
          this.populatedDays.push({ 'key': prettyName, 'value': key });
        }
      } else {
        if (ind != -1) {
          this.populatedDays.splice(ind, 1);
        }
      }
    });
  }

  ngDoCheck() {
   this.checkAvailabilityDays();
   this.recalculateCopyDays();
  }

  @Output() availValid = new EventEmitter();

  emitValid(){
    this.availValid.emit('?');
  }

  //check that the availability exists and that at least one day has been set to true and has time
  checkAvailabilityDays(): void {
    let ret = true;
    let nodays = 0;
      //validate that we have start and end times for available days
      for (let day in this.availability) {
        let checkDay = this.availability[day];

        if (checkDay.available) {

          if (checkDay.startTime == null || checkDay.startTime.length == 0) {
            this.errorReply = day.substring(0, 1).toUpperCase() + day.substring(1, day.length) + " start time required!";
            ret = false;
          } else if (checkDay.endTime == null || checkDay.endTime.length == 0) {
            this.errorReply = day.substring(0, 1).toUpperCase() + day.substring(1, day.length) + " end time required!";
            ret = false;
            ret = false;
          } else if (false) {
            ret = false;
          } else {
            let endTimeStrArr = checkDay.endTime.split(':');
            let endTime = new Date();
            endTime.setMinutes(endTimeStrArr[1]);
            endTime.setHours(endTimeStrArr[0]);
            let startTime = new Date();
            let startTimeStrArr = checkDay.startTime.split(':');
            startTime.setMinutes(startTimeStrArr[1]);
            startTime.setHours(startTimeStrArr[0]);
            if (startTime >= endTime) {
              this.errorReply = day.substring(0, 1).toUpperCase() + day.substring(1, day.length) + " end time must be later than start time!";
              ret = false;
            }
          }
        } else {
          nodays += 1;
        }
      }
    if (nodays == 7) {
      // ret = false;
      // this.errorReply = 'Must include at least 1 day of availability';
    }
    if (ret) {
      this.errorReply = '';
    }
    this.errorAvail = !ret;
    this.availValid.emit({valid:ret,numdays:7-nodays});
  }

}
