import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-drop-down-time',
  templateUrl: './drop-down-time.component.html',
  styleUrls: ['./drop-down-time.component.css']
})
export class DropDownTimeComponent implements OnInit {

  constructor() { }

  times:any=[];
  editOn:boolean=false;

  _time:any;
  _suffix:any;
  amPm = ['PM', 'AM']; //local propery holds array for the am/pm dropdown

  locPlaceholder:string='Select time';

  @Input() set placeholder(_placeHolder){
    if(_placeHolder!=null&&_placeHolder!=undefined){
      this.locPlaceholder=_placeHolder;
    }
  }

  @Input() set disabled(_editOn){
    if (_editOn != null && _editOn != undefined) {
      this.editOn = _editOn;
    }
  }

  @Output() timeChange = new EventEmitter();

  @Input() set time(_time){
    if (_time != null && _time != undefined) {
      let time = _time.split(':');
      let hours = parseInt(time[0]);
      if(hours == 0){
        this._suffix = 'AM';
        hours = 12;
      }else if(hours>12){
        this._suffix = 'PM';
        hours = hours-12;
      }else{
        this._suffix='AM';
      }
      this._time = hours.toString()+':'+time[1];
    }
  }

  calcTime(){
    let colonSplit = this._time.split(':');

    // colonSplit[1] = parseInt(colonSplit[1]);
    if(this._suffix != undefined && this._suffix != null){
      colonSplit[0] = parseInt(colonSplit[0]);
      if (this._suffix == 'PM'  && colonSplit[0] != 12) {
        colonSplit[0] += 12;
      } else if (this._suffix == 'AM' && colonSplit[0] == '12') {
        colonSplit[0] = parseInt(colonSplit[0]);
        colonSplit[0] = 0;
      }
      // console.log(colonSplit);
      let strTime = colonSplit[0].toString() + ':' + colonSplit[1];

      this.timeChange.emit(strTime);
    }



  }

  ngOnInit() {
    //build out the selectable times for the user, in 15 min intervals
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

}
