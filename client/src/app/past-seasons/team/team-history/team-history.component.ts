import { Component, OnInit, Input } from '@angular/core';
import { Team } from 'src/app/classes/team.class';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-team-history',
  templateUrl: './team-history.component.html',
  styleUrls: ['./team-history.component.css']
})
export class TeamHistoryComponent implements OnInit {

  constructor(public util:UtilitiesService) { }

  timewrap(time) {
    return this.util.getFormattedDate(time, 'MM/DD/YYYY')
  }

  profile = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  @Input() set teamProfile(_source) {
    this.profile = _source;
  }

  ngOnInit() {
  }

}
