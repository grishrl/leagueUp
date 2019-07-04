import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.css']
})
export class YoutubeComponent implements OnInit {

  edit: boolean = false;

  @Input() set disabled(val) {
    this.edit = val;
  }

  youtubeValue: string;

  @Output()
  youtubeChange = new EventEmitter();

  @Input()
  get youtube() {
    return this.youtubeValue;
  }

  set youtube(val) {
    this.youtubeValue = val;
    this.youtubeChange.emit(this.youtubeValue);
  }

  update() {
    this.youtubeChange.emit(this.youtubeValue);
  }


  constructor() { }

  ngOnInit() {
  }
}
