import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Profile } from '../../../classes/profile.class';

@Component({
  selector: 'app-user-quick-view',
  templateUrl: './user-quick-view.component.html',
  styleUrls: ['./user-quick-view.component.css']
})
export class UserQuickViewComponent implements OnInit {
  _user:string

  @Input() set userId(usr){
    if(usr != null && usr != undefined){
      this.player = usr;
    }
    
  }

  player = new Profile(null, null, null, null, null);

  constructor(private user: UserService) { }

  ngOnInit() {
    // if(this._user!=undefined && this._user!=null){
    //   this.user.getUser(this._user).subscribe( res=>{
    //     this.player = res;
    //   })
    // }
 
  }

}
