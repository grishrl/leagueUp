import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-play-history',
  templateUrl: './play-history.component.html',
  styleUrls: ['./play-history.component.css']
})
export class PlayHistoryComponent implements OnInit {

  constructor() { }

  competitonLevel = [
    { val: 1, display: 'Low' },
    { val: 3, display: 'Medium' },
    { val: 5, display: 'High' }
  ]

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
