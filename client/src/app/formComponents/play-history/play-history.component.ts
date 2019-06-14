import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-play-history',
  templateUrl: './play-history.component.html',
  styleUrls: ['./play-history.component.css']
})
export class PlayHistoryComponent implements OnInit {

  constructor() { }

  edit: boolean = false;

  @Input() set disabled(val) {
    this.edit = val;
  }

  descriptionValue: string;

  @Output()
  descriptionChange = new EventEmitter();

  @Input()
  get description() {
    return this.descriptionValue;
  }

  set description(val) {
    this.descriptionValue = val;
    this.descriptionChange.emit(this.descriptionValue);
  }

  updateModel(val){
    this.descriptionChange.emit(this.descriptionValue);
  }

  ngOnInit() {
  }

}
