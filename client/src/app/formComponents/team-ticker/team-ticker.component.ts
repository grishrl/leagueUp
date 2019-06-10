import { Component, OnInit, Input, Self, Optional } from '@angular/core';
import { ControlValueAccessor, FormControl, Validators, ValidatorFn, NgControl, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { TeamService } from 'src/app/services/team.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-team-ticker',
  templateUrl: './team-ticker.component.html',
  styleUrls: ['./team-ticker.component.css']
})


export class TeamTickerComponent implements OnInit, ControlValueAccessor {

  filterWords;
  constructor(private team: TeamService, private http: HttpClient,@Optional() @Self() public controlDir:NgControl) {
    this.http.get('../assets/filterWords.json').subscribe(
      res => { this.filterWords = res['data'] },
      err => { console.log(err) }
    )
    controlDir.valueAccessor = this;
   }

  ngOnInit() {
    const control = this.controlDir.control;
    let validators = control.validator ? [ control.validator, Validators.required, this.validTicker(this.filterWords) ] : Validators.required
    control.setValidators(validators);
    control.setAsyncValidators(this.validateTickerNotTaken());
    control.updateValueAndValidity();

  }

  validTicker(filterWords):ValidatorFn{
    return (control: FormControl) => {
      let value = control.value;
      if (filterWords && filterWords.length > 0) {
        console.log('value ', value, ' filterWords.indexOf(value) ', filterWords.indexOf(value));
        return filterWords.indexOf(value) > -1 ? { invalidTicker: true } : null;
      } else {
        return null;
      }
    }
  }

  validateTickerNotTaken(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      if (this.originalValue == control.value){
        return of(null);
      }else{
        return this.team.getTeam(control.value)
          .pipe(
            map(res => {
              let keys = Object.keys(res);
              if (keys.length > 0) {
                return { 'notUnique': true };
              }
            })
          );
      }

    };
  }

  validate(ctrl:AbstractControl){
    return ctrl.setErrors(this.controlDir.errors);
  }

  @Input()
  name: string;
  @Input('value')
  val: string;

  invalidWord: boolean = false;
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

  writeValue(value){
    if (value) {
      this.originalValue = value;
      this.value = value;
    }
  }

  registerOnChange(fn){
    this.onChange = fn;
  }

  registerOnTouched(fn){
    this.onTouched = fn;
  }

  setDisabledState(){
    //todo:
  }

}
