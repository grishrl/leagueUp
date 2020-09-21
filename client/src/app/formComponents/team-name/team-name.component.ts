import { Component, OnInit, Input, Optional, Self } from '@angular/core';
import { FormControl, NgControl, Validators, AbstractControl, AsyncValidatorFn, ValidatorFn, ControlValueAccessor } from '@angular/forms';
import { TeamService } from 'src/app/services/team.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: "app-team-name",
  templateUrl: "./team-name.component.html",
  styleUrls: ["./team-name.component.css"]
})
export class TeamNameComponent implements OnInit, ControlValueAccessor {
  constructor(
    private team: TeamService,
    @Optional() @Self() public controlDir: NgControl
  ) {
    controlDir.valueAccessor = this;
  }

  @Input()
  name: string;

  @Input("value")
  val: string;

  invalidWord: boolean = false;
  // Both onChange and onTouched are functions
  onChange: any = () => {
    // this.localValidator(this.value, this.filterWords);
  };
  onTouched: any = () => {};

  get value() {
    return this.val;
  }

  set value(val) {
    this.val = val;
    this.onChange(val);
    this.onTouched();
  }

  originalValue;

  writeValue(value) {
    if (value) {
      this.originalValue = value;
      this.value = value;
    }
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  setDisabledState() {}

  validate(ctrl: AbstractControl) {
    return ctrl.setErrors(this.controlDir.errors);
  }

  errors = [];

  lastChange = Date.now();
  checkNameFree(): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Observable<{ [key: string]: any } | null> => {
      let trimmedVal = this.controlDir.value.trim();
      if (this.originalValue == control.value) {
        this.originalValue = trimmedVal;
        return of(null);
      } else {
        return this.team.getTeam(trimmedVal).pipe(
          map((res) => {
            let keys = Object.keys(res);
            if (keys.length > 0) {
              return { taken: true };
            }
          })
        );
      }
    };
  }

  checkInvalidCharacters(): ValidatorFn {
    return (control: FormControl) => {
      let regEx = new RegExp(/[%_\/\\`#]/gm);
      if (regEx.test(control.value.trim())) {
        return { invalidCharacters: true };
      } else {
        return null;
      }
    };
  }

  nameContorl = new FormControl();

  ngOnInit(): void {
    const control = this.controlDir.control;
    let validators = control.validator
      ? [control.validator, Validators.required, this.checkInvalidCharacters]
      : Validators.required;
    control.setValidators(validators);
    control.setAsyncValidators(this.checkNameFree());
    control.updateValueAndValidity();
  }
}
