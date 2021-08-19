import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TimezoneService } from 'src/app/services/timezone.service';

@Component({
  selector: 'app-timezone',
  templateUrl: './timezone.component.html',
  styleUrls: ['./timezone.component.css']
})
export class TimezoneComponent implements OnInit {

  constructor(public timezoneServ: TimezoneService) { }

  edit: boolean = false;

  @Input() set disabled(val) {
      this.edit = val;
  }


  timezoneControl = new FormControl({ value: '', disabled: true }, [
    // Validators.required
  ]);

  timezoneValue: string;

  // @Input() timezone;
  // @Output() timezoneChange = new EventEmitter

  @Output()
  timezoneChange = new EventEmitter();

  @Input()
  get timezone() {
    return this.timezoneValue;
  }

  set timezone(val) {
    this.timezoneValue = val;
    this.timezoneChange.emit(this.timezoneValue);
  }

  errorValue
  @Input()
  get error() {
    return this.errorValue;
  }

  @Output()
  errorValueChange = new EventEmitter();

  set error(val) {
    if(val && val.hasOwnProperty('error') && val.error){
      this.timezoneControl.setErrors({ required: true });
    }else{
      this.timezoneControl.setErrors(null);
    }
    this.errorValue = val;
    this.errorValueChange.emit(this.errorValue);
  }

  ngOnInit() {
    this.timezoneControl.markAsTouched();
  }

  ngOnChanges(change) {

    if (change.disabled && change.disabled.currentValue == false) {
      this.timezoneControl.enable();
    }

  }

  timezoneUpdate() {
    if (this.timezoneValue != null || this.timezoneValue != undefined) {
      this.timezoneChange.emit(this.timezoneValue);
      this.timezoneControl.setErrors(null);
    }
  }

}
