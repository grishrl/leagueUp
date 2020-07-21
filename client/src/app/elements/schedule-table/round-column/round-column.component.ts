import { Component, OnInit, Input } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-round-column',
  templateUrl: './round-column.component.html',
  styleUrls: ['./round-column.component.css']
})
export class RoundColumnComponent implements OnInit {

  constructor(private util:UtilitiesService) { }

  @Input() match;

  showRound;
  ngOnInit(): void {

    if(this.match){
      let deadline = this.util.returnBoolByPath(this.match, 'hasDeadline');
      let type = false;
      if(this.util.returnBoolByPath(this.match, 'type')){
        type = this.match.type == 'tournament';
      }
      this.showRound = deadline || type;
    }

  }
  }
