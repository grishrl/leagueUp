import { Component, OnInit, Input } from '@angular/core';
import { EventsService } from 'src/app/services/events.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-event-display',
  templateUrl: './event-display.component.html',
  styleUrls: ['./event-display.component.css']
})
export class EventDisplayComponent implements OnInit {

  constructor(private eventService:EventsService, public util: UtilitiesService) { }

  _eventID;
  _event;

  @Input() set eventId(_id){
    this._eventID = _id;
  }

  _showImage = true;
  @Input() set showImage(show){
    if(!this.util.isNullOrEmpty(show)){
      this._showImage = show;
    }
  }

  @Input() set event(_event){
    if(_event){
      this._event=_event;
    }else{
      this._event = this.getBlankEvent();
    }
  }

  ngOnInit() {
    if(!this.util.isNullOrEmpty(this._eventID)){
      this.eventService.getEventById(this._eventID).subscribe(
        res=>{
          this._event = res;
        },
        err=>{
          console.log(err);
        }
      )
    }
  }

  returnDate(){
    if(this._event.eventDate){
      return this.util.getDateFromMS(this._event.eventDate) + ' ' +
        this.util.getTimeFromMS(this._event.eventDate) + ' ' +
        this.util.getSuffixFromMS(this._event.eventDate);
    }else{
      return '';
    }
  }

  imgUrl(){
    if (this._event.eventImage){
      return this.util.generalImageFQDN(this._event.eventImage);
    }
  }

  eventUrl(){
    return this.util.prePendHttp(this._event.eventLink);
  }

  getBlankEvent(){
    return {
      "eventName": "",
      "eventDate": null,
      "eventDescription": "",
      "eventLink": "",
      "eventBlurb": "",
      "eventImage": "",
    }
  }
}
