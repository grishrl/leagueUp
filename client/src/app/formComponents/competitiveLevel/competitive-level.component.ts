import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-competitive-level',
  templateUrl: './competitive-level.component.html',
  styleUrls: ['./competitive-level.component.css']
})
export class TextInputComponent implements OnInit {

  edit:boolean=false;

  @Input() set disabled(val){
    this.edit = val;
  }

  competitonLevel = [
    { val: 1, display: 'Low' },
    { val: 3, display: 'Medium' },
    { val: 5, display: 'High' }
  ]

  messageValue: string;

  @Output()
  messageChange = new EventEmitter();

  @Input()
  get message() {
    return this.messageValue;
  }

  set message(val) {
    this.messageValue = val;
    this.messageChange.emit(this.messageValue);
  }

  constructor() { }

  ngOnInit() {
  }

}
