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


  timezoneValue: string;

  timezoneControl = new FormControl({ value: '', disabled: true }, [
    // Validators.required
  ]);

  @Output()
  timezoneValueChange = new EventEmitter();

  @Input()
  get timezone() {
    return this.timezoneValue;
  }

  set timezone(val) {
    this.timezoneValue = val;
    this.timezoneValueChange.emit(this.timezoneValue);
  }

  ngOnInit() {
  }

  ngOnChanges(change) {

    if (change.disabled && change.disabled.currentValue == false) {
      this.timezoneControl.enable();
    }

  }

  timezoneUpdate() {
    if (this.timezoneValue != null || this.timezoneValue != undefined) {
      this.timezoneControl.setErrors(null);
    }
  }

}
