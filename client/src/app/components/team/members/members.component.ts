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
      this.teamMembers = val.teamMembers;
    }
  }

  handleRemove(obj){
    let index = -1;
    this.teamMembers.forEach((ele, ind) => {
      index = ind;
      ele.displayName == obj
    });
    if(index>-1){
      this.teamMembers.splice(index, 1);
    }
  }

  ngOnInit() {
  }

}
