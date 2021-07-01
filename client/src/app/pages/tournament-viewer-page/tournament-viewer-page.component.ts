import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tournament-viewer',
  templateUrl: './tournament-viewer-page.component.html',
  styleUrls: ['./tournament-viewer-page.component.css']
})
export class TournamentViewerComponent implements OnInit {

  constructor() { }

  index = 0;

  ngOnInit(): void {
  }

}
