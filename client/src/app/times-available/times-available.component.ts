import { Component, OnInit, Input, Output, EventEmitter, DoCheck } from '@angular/core';
import { UtilitiesService } from '../services/utilities.service';

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
      "endTime": null
    },
    "tuesday": {
      "available": false,
      "startTime": null,
      "endTime": null
    },
    "wednesday": {
      "available": false,
      "startTime": null,
      "endTime": null
    }
    , "thursday": {
      "available": false,
      "startTime": null,
      "endTime": null
    }
    , "friday": {
      "available": false,
      "startTime": null,
      "endTime": null
    }
    , "saturday": {
      "available": false,
      "startTime": null,
      "endTime": null
    }
    , "sunday": {
      "available": false,
      "startTime": null,
      "endTime": null
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
        endTime: null
      }  
    }
    
    console.log(day)
  }

  fillFrom(targetDay, sourceDay) {
    this.availability[targetDay] = Object.assign({},this.availability[sourceDay]);
    this.recalculateCopyDays();
  }

  @Input() set availObj(_obj){
    if(typeof _obj == 'object' && _obj != null && _obj != undefined){
      this.availability = _obj;
    }
  }

  displayText: string ='Times the team plays and practices:';
  @Input() set customText(_text){
    if (typeof _text == 'string' && _text != null && _text != undefined){
      this.displayText = _text;
    }
  }

  editOn:boolean=false;
  @Input() set disabled(_editOn) {
    if (typeof _editOn == 'boolean' && _editOn != null && _editOn != undefined) {
      this.editOn = _editOn;

      this.recalculateCopyDays();
    }
  }

  recalculateCopyDays() {
    this.populatedDays = [];
    let keys = Object.keys(this.availability);
    keys.forEach(element => {
      if (this.availability[element].available) {        
        let firstChar = element.charAt(0);
        firstChar = firstChar.toUpperCase();
        let prettyName = firstChar + element.substring(1, element.length);
        this.populatedDays.push({ 'key': prettyName, 'value': element });
      }
    });
  }

  ngDoCheck() {
   this.checkAvailabilityDays();
  }

  @Output() availValid = new EventEmitter();

  emitValid(){
    this.availValid.emit('?');
  }

  modelChange(){
    console.log('model is changing!')
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
            // console.log('checkDay.startTime ', checkDay.startTime);
            // console.log('checkDay.endTime ', checkDay.endTime);
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
      ret = false;
      this.errorReply = 'Must include at least 1 day of availability';
    }
    if (ret) {
      this.errorReply = '';
    }
    this.errorAvail = !ret;
    this.availValid.emit(ret);
  }

}
