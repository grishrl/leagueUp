import { Component, OnInit, Input } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { EventsService } from 'src/app/services/events.service';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'lodash';
import { forEach as _forEach } from 'lodash';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.css']
})
export class EventCreateComponent implements OnInit {

  recId;
  constructor(private util:UtilitiesService, private eventService:EventsService, private route:ActivatedRoute) {
    if (this.route.snapshot.params['id']) {
      this.recId = this.route.snapshot.params['id'];
    }
  }

  event;

  eventOrig;

  editEvent = false;

  suffix;
  friendlyTime;
  friendlyDate;
  times=[];
  amPm = ['PM', 'AM'];

  // @Input() set editEvent(_event){
  //   if(!this.util.isNullOrEmpty(_event)){
  //     this.event = _event;
  //     this.editEvent = true;
  //   }
  // }

  ngOnInit() {
    this.event = this.getBlankEvent();
    this.eventOrig = this.getBlankEvent();
  if(this.recId=='new'){
      this.event = this.getBlankEvent();
  }else if (this.recId) {
    this.editEvent = true;
      this.eventService.getEventById(this.recId).subscribe(
        res=>{
          this.event = cloneDeep(res);
          this.eventOrig = cloneDeep(res);
          // this.friendlyDate = this.util.getDatePickerFormatFromMS(this.event['eventDate']);
          this.friendlyTime = this.util.getTimeFromMS(this.event['eventDate']);
          this.suffix = this.util.getSuffixFromMS(this.event['eventDate']);
        },
        err=>{
          console.log(err);
        }
      )
    }
    for (let i = 1; i < 13; i++) {
      for (let j = 0; j <= 3; j++) {
        let min: any = j * 15;
        if (min == 0) {
          min = '00';
        }
        let time = i + ":" + min;
        this.times.push(time);
      }
    }
  }

  saveEvent(){


    if (this.event['eventDate'] && this.friendlyTime) {
      this.friendlyDate = moment(this.event["eventDate"]);

      let msDate = this.util.returnMSFromFriendlyDateTime(this.friendlyDate, this.friendlyTime, this.suffix);
      this.event['eventDate'] = msDate;

    }

    delete this.eventOrig['_id'];
    delete this.event['_id'];

    //save the event
    let submit = true;

    _forEach(this.event, (value, key)=>{
      if (key != 'eventImage' && this.util.isNullOrEmpty(value)) {
        alert(key);
        submit = false;
      }
    });

    if(submit){
      if (this.editEvent) {
        this.eventService.upsertEvent(this.eventOrig, this.event).subscribe(
          res => {
            //saved
            this.event['_id']=res['_id'];
          },
          err => {
            console.log(err)
          }
        )
      } else {
        this.eventOrig = {};
        this.eventService.upsertEvent(this.eventOrig, this.event).subscribe(
          res => {
            //saved
            this.event['_id'] = res['_id'];
          },
          err => {
            console.log(err)
          }
        )
      }
    }

  }

  getBlankEvent() {
    return {
      "_id":null,
      "eventName": "",
      "eventDate": null,
      "eventDescription": "",
      "eventLink": "",
      "eventBlurb": "",
      "eventImage": "",
    }
  }
}
