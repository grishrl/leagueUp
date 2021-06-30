import { Component, OnInit, Input, Optional, Self } from '@angular/core';
import { FormControl, NgControl, Validators, AbstractControl, AsyncValidatorFn, ValidatorFn, ControlValueAccessor } from '@angular/forms';
import { TeamService } from 'src/app/services/team.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: "app-team-name",
  templateUrl: "./team-name.component.html",
  styleUrls: ["./team-name.component.css"]
})
export class TeamNameComponent implements OnInit, ControlValueAccessor {

  filterWords;
  constructor(
    private team: TeamService,
    private http: HttpClient,
    @Optional() @Self() public controlDir: NgControl
  ) {
    this.http.get('../assets/filterWords.json').subscribe(
      res => {
        this.filterWords = res['data']
        this.ngOnInit();
      },
      err => { console.log(err) }
    )
    controlDir.valueAccessor = this;
  }

  nameCtrl = new FormControl();

  ngOnInit(): void {
    const control = this.controlDir.control;
    console.log('control.validator', control.validator);
    let validators = [this.checkInvalidCharacters(), this.validateWords(this.filterWords)];
    if (control.validator) {
      if (Array.isArray(control.validator)) {
        validators = validators.concat(control.validator);
      } else {
        validators.push(control.validator);
      }

    }
    control.setValidators(validators);
    control.setAsyncValidators(this.checkNameFree());
    control.updateValueAndValidity();
    this.nameCtrl = control as FormControl;
  }

  checkNameFree(): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Observable<{ [key: string]: any } | null> => {
      let val = this.controlDir.value;
      if (val && val.length > 0) {
        let trimmedVal = val.trim();
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
      } else {
        return of(null);
      }

    };
  }

  validate(ctrl: AbstractControl) {
    return ctrl.setErrors(this.controlDir.errors);
  }

  checkInvalidCharacters(): ValidatorFn {
    return (control: FormControl) => {
      let regEx = new RegExp(/[%_\/\\`#]/gm);
      console.log('aaaa')
      let val = control.value;
      let trimmedVal = val ? val.trim() : '';
      console.log('trimmedVal', trimmedVal, regEx.test(trimmedVal))
      return regEx.test(trimmedVal) ? { invalidCharacters: true } : null;
    };
  }

  // filter undesirable words
  validateWords(filterWords): ValidatorFn {
    return (control: FormControl) => {
      let value = control.value;

      if (filterWords && filterWords.length > 0 && value && value.length > 0) {
        let invalid = false;
        let valueArr = value.split(' ');
        valueArr.forEach(element => {
          if (filterWords.indexOf(element) > -1) {
            invalid = true;
          }
        });
        valueArr = value.split(',');
        valueArr.forEach(element => {
          if (filterWords.indexOf(element) > -1) {
            invalid = true;
          }
        });
        if (invalid) {
          return { 'invalidWord': true };
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
  }

  @Input()
  name: string;

  @Input("value")
  val: string;

  // Both onChange and onTouched are functions
  onChange: any = () => {
    // this.localValidator(this.value, this.filterWords);
  };
  onTouched: any = () => { };

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

  setDisabledState() { }

}
