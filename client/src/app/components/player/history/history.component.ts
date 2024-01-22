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

  profile = new Profile(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

  @Input() set playerProfile(_source) {
    this.profile = _source;
  }

  public get sortHistory(){
    if (this.profile.history && this.profile.history.length > 0) {
      this.profile.history = this.profile.history.sort((a, b) => {
        if (a.timestamp > b.timestamp) {
          return -1;
        } else {
          return 1;
        }
      })
    }
    return this.profile.history;
  }

}
