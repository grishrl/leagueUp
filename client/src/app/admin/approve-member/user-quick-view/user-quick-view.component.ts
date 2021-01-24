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
  player = new Profile(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  errorState = false;

  //input bindings
  @Input() set userId(usr){
    if(usr != null && usr != undefined && usr._id.length>0 && usr.displayName.length>0){
      this.player = usr;
      this.errorState = false;
    }else{
      this.errorState = true;
    }
  }

  constructor(public user: UserService) { }

  ngOnInit() {

  }

}
