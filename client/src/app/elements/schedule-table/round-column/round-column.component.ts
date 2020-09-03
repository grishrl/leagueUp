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
      if(this.util.returnBoolByPath(this.match, 'type')){
        if(this.match.type == 'tournament'){
          this.showRound = true;
        }
      }else if(!this.util.returnBoolByPath(this.match, 'type')){
        this.showRound = this.util.returnBoolByPath(this.match, "scheduleDeadline");
      }
    }
  }
  }
