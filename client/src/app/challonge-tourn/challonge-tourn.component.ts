import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-challonge-tourn',
  templateUrl: './challonge-tourn.component.html',
  styleUrls: ['./challonge-tourn.component.css']
})
export class ChallongeTournComponent implements OnInit {

  constructor() { }

  ngOnInit() {

    $('.tournament').challonge('my_ngs_test_2', { subdomain: '', theme: '1', multiplier: '2.0', match_width_multiplier: '1.5', show_final_results: '0', show_standings: '1' });

  }

}
