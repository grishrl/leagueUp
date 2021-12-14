import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-thread',
  templateUrl: './create-thread.component.html',
  styleUrls: ['./create-thread.component.css']
})
export class CreateThreadComponent implements OnInit {

  threadName;

  constructor() { }

  ngOnInit(): void {
  }

  createThread(a){
    console.log(a);
  }

}
