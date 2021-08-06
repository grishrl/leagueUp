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
      let type = this.util.returnByPath(this.match, 'type');
      if(type == 'tournament'){
          this.showRound = 'round';
      }else if(type == 'bye'){
        this.showRound = "round";
      }
      else if(type == 'seasonal' ){
        this.showRound = this.util.returnBoolByPath( this.match, "scheduleDeadline" ) ? "round" : "flex";
      }else{
        this.showRound = this.util.returnBoolByPath( this.match, "scheduleDeadline" ) ? "round" : "flex";
      }
    }
  }
  }
