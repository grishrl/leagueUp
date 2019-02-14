import { Component, OnInit } from '@angular/core';
import { EventsService } from 'src/app/services/events.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {

  constructor(private eventService: EventsService) { }

  events=[]

  ngOnInit() {
    this.eventService.getAll().subscribe(
      res=>{
        this.events = res;
      },
      err=>{
        console.log(err);
      }
    )
    
  }

  openEvent(){
    //todo
  }
}
