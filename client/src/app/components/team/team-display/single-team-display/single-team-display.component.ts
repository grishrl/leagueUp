import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-single-team-display',
  templateUrl: './single-team-display.component.html',
  styleUrls: ['./single-team-display.component.css']
})
export class SingleTeamDisplayComponent implements OnInit, OnChanges {

  constructor(private Team:TeamService) { }

  @Input() item;
  @Input() season;

ngOnChanges(changes:SimpleChanges){
  if(changes){
    if(changes['item'].currentValue){
      this.item.logo = this.Team.imageFQDN(this.item.logo);
    }
  }
}

  ngOnInit(): void {
  }

}
