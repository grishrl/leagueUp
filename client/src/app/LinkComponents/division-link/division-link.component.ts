import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-division-link',
  templateUrl: './division-link.component.html',
  styleUrls: ['./division-link.component.css']
})
export class DivisionLinkComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }



  @Input() division:string;

}
