import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-champ-expander',
  templateUrl: './champ-expander.component.html',
  styleUrls: ['./champ-expander.component.css']
})
export class ChampExpanderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  hide=true;

  @Input() match;

}
