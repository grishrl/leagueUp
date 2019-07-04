import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-twitter',
  templateUrl: './twitter.component.html',
  styleUrls: ['./twitter.component.css']
})
export class TwitterComponent implements OnInit {


  edit: boolean = false;

  @Input() set disabled(val) {
    this.edit = val;
  }

  twitterValue: string;

  @Output()
  twitterChange = new EventEmitter();

  @Input()
  get twitter() {
    return this.twitterValue;
  }

  set twitter(val) {
    this.twitterValue = val;
    this.twitterChange.emit(this.twitterValue);
  }

  update() {
    this.twitterChange.emit(this.twitterValue);
  }


  constructor() { }

  ngOnInit() {
  }
}
