import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-twitch',
  templateUrl: './twitch.component.html',
  styleUrls: ['./twitch.component.css']
})
export class TwitchComponent implements OnInit {

  edit: boolean = false;

  @Input() set disabled(val) {
    this.edit = val;
  }

  twitchValue: string;

  @Output()
  twitchChange = new EventEmitter();

  @Input()
  get twitch() {
    return this.twitchValue;
  }

  set twitch(val) {
    this.twitchValue = val;
    this.twitchChange.emit(this.twitchValue);
  }

  update() {
    this.twitchChange.emit(this.twitchValue);
  }


  constructor() { }

  ngOnInit() {
  }
}
