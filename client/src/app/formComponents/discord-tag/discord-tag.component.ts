import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-discord-tag',
  templateUrl: './discord-tag.component.html',
  styleUrls: ['./discord-tag.component.css']
})
export class DiscordTagComponent implements OnInit, OnChanges {

  constructor() { }



  ngOnInit() {
    this.discordTagFormControl.markAsTouched();
  }

  errorValue
  @Input()
  get error() {
    return this.errorValue;
  }

  @Output()
  errorValueChange = new EventEmitter();

  set error(val) {
    if (val && val.hasOwnProperty('error') && val.error) {
      if(val.error.type == 'required'){
        this.discordTagFormControl.setErrors({ required: true });
      }
      if (val.error.type == 'invalidTag') {
        this.discordTagFormControl.setErrors({ invalidTag: true });
      }
    } else {
      this.discordTagFormControl.setErrors(null);
    }
    this.errorValue = val;
    this.errorValueChange.emit(this.errorValue);
  }

  edit: boolean = false;

  @Input() set disabled(val) {
    this.edit = val;
  }

  discordTagValue: string;

  @Output()
  discordTagChange = new EventEmitter();

  @Input()
  get discordTag() {
    return this.discordTagValue;
  }

  set discordTag(val) {
    this.discordTagValue = val;
    this.discordTagChange.emit(this.discordTagValue);
  }

  discordTagFormControl = new FormControl({ value: '', disabled: true }, [
    Validators.required
  ]);

ngOnChanges(change){

  if (change.disabled && change.disabled.currentValue == false){
    this.discordTagFormControl.enable();
  }

}

  update(){
    if(this.discordTagValue.length == 0 ){
      this.discordTagFormControl.setErrors({ required: true });
      this.errorValue = { error: true, type: 'required' }
    }else{
      if (this.discordTagFormControl.status == 'VALID') {
        this.discordTagChange.emit(this.discordTagValue);
        this.errorValue = { error: false };
      } else {
        this.discordTagFormControl.setErrors({ invalidTag: true });
        this.errorValue = { error: true, type: 'invalidTag' }
      }
    }

  }

  discordPatternValidator(control: FormControl) {
    let discordTag = control.value;
    if (discordTag) {
      if (discordTag && discordTag.indexOf('#') <= 0) {
        return { invalidTag: true }
      } else {
        let tagArr = discordTag.split('#');
        let regex = new RegExp(/(\d{4})/);
        if (tagArr[1].length == 4 && regex.test(tagArr[1])) {
          return null;
        } else {
          return { invalidTag: true }
        }
      }
    } else {

    }
  }

}
