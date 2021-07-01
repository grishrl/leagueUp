import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-members-display',
  templateUrl: './members-display.component.html',
  styleUrls: ['./members-display.component.css']
})
export class MembersDisplayComponent implements OnInit {
  _members:Array<any>=[]

  @Input() perColumn: any
  @Input() set members(members){
    if(members != null && members != undefined && members.length){
      this._members = members;
      // this.createMembersDisplay()
    }else{
      this._members = [];
    }
    }
  get members(){
    return this._members;
  }

  memberRows: Array<any> = []

  createMembersDisplay(){
    if(!this.perColumn){
      this.perColumn=2;
    }
    this.memberRows = [];
    if (this._members != undefined && this._members.length > 0) {
      if (this._members.length > this.perColumn) {
        for (var i = 0; i < this._members.length; i++) {
          let temparr = [];
          if (i % this.perColumn == 0) {
            this.memberRows.push(temparr);
            temparr = [];
          }
          temparr.push(this._members[i]);
        }
      } else {
        this.memberRows.push(this._members);
      }
    } else {
      this.memberRows = [];
    }
  }

  constructor(public user:UserService) { }

  ngOnInit() {
  }

}
