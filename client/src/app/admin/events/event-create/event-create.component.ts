import { Component, OnInit, Input } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { EventsService } from 'src/app/services/events.service';
import { ActivatedRoute } from '@angular/router';

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

  event = {};
  
  eventOrig = {};
  
  editEvent = false;

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
          this.event = res;
          this.eventOrig = res;
        },
        err=>{
          console.log(err);
        }
      )
    }
  }

  saveEvent(){
    //save the event
    let keys = Object.keys(this.event);
    let submit = true;
    keys.forEach(key=>{
      if(this.util.isNullOrEmpty(this.event[key])){
        submit=false;
      }
    });
    if(submit){
      if (this.editEvent) {

        this.eventService.upsertMatch(this.eventOrig, this.event).subscribe(
          res => {
            //saved
          },
          err => {
            console.log(err)
          }
        )
      } else {
        this.eventOrig = {};
        this.eventService.upsertMatch(this.eventOrig, this.event).subscribe(
          res => {
            //saved
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
