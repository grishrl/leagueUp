import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {

  constructor() { }

  teamMembers=[];
  profile;
  @Input() set teamProfile(val){
    if(val){
      this.profile = val;
      console.log('this.profile ', this.profile);
      this.teamMembers = val.teamMembers;
    }
  }

  ngOnInit() {
  }

}
