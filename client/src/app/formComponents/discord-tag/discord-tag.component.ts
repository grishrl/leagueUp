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
    Validators.required,
    this.discordPatternValidator
  ]);

ngOnChanges(change){

  if(change.disabled.currentValue == false){
    this.discordTagFormControl.enable();
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
