import { Component, OnInit, Input } from '@angular/core';
import { Profile } from 'src/app/classes/profile.class';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  constructor(public util:UtilitiesService) { }

  ngOnInit() {
  }

  timewrap(time){
    return this.util.getFormattedDate(time, 'MM/DD/YYYY')
  }

  profile = new Profile(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  @Input() set playerProfile(_source) {
    this.profile = _source;
  }

}
