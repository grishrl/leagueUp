import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {

  constructor() { }

  teamMembers=[];
  @Input() set members(val){
    if(val){
      this.teamMembers = val;
    }
  }

  ngOnInit() {
  }

}
