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
  get competitiveLevel() {
    return this.messageValue;
  }

  set competitiveLevel(val) {
    this.messageValue = val;
    this.messageChange.emit(this.messageValue);
  }

  updateValue(){
    this.messageChange.emit(this.messageValue);
  }

  getDisplay(val){
    let ret;
    this.competitonLevel.forEach(iter=>{
      if(iter.val == val){
        ret = iter.display;
      }
    });
    if(!ret){
      ret = 'Error in compettive level method';
    }
    return ret;
  }

  constructor() { }

  ngOnInit() {
  }

}
