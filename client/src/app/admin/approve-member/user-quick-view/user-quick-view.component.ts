import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Profile } from '../../../classes/profile.class';

@Component({
  selector: 'app-user-quick-view',
  templateUrl: './user-quick-view.component.html',
  styleUrls: ['./user-quick-view.component.css']
})
export class UserQuickViewComponent implements OnInit {
  //component properties
  _user:string
  player = new Profile(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

  //input bindings
  @Input() set userId(usr){
    if(usr != null && usr != undefined){
      this.player = usr;
      // console.log(this.player);
    } 
  }

  constructor(public user: UserService) { }

  ngOnInit() {

  }

}
