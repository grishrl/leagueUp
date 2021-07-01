import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';



@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit {

  usersToFilter: any[] = [];

  noResults = false;
  priorSelect: any
  lastChange: number = 0;
  selectedUser:any
  btnTxt:string
  cantClick:boolean = false;

  disableButton:boolean = false;

  @Output() userSelected = new EventEmitter();

  userSelect(user){
    this.priorSelect = this.selectedUser;
    this.selectedUser = user;
    this.disableButton = true;
    this.userSelected.emit(user);
  }

  @Input() set buttonText(text){
    if(text!=undefined&&text!=null){
      this.btnTxt = text;
    }else{
      this.btnTxt = "Seach";
    }
  }

  userSearchType:string = 'all';
  @Input() set type(_type){
    if (_type != null && _type != undefined && _type.length > 0) {
      this.userSearchType = _type;
    } else {
      this.userSearchType = 'all'
    }
  }

  @Input() set filterUser(users){
    if(users != null && users != undefined && users.length>0){
      this.usersToFilter = users;
    }else{
      this.usersToFilter = []
    }
  }

  message:string

  filterUsers(master, remove){
    remove.forEach(element => {
      let index = master.indexOf(element)
      if(index >-1 ){
        master.splice(index, 1);
      }
    });
    return master;
  }

  userCtrl = new FormControl();
  foundUsers: any[]
  search: string

  unresolved = false;
  constructor(private users: UserService, private Auth:AuthService) {
    this.userCtrl.valueChanges.subscribe(
      data => {
        if(data && data.length>2){
          this.disableButton = false;
          //give this a delay so we don't swamp the server with calls! .875 seconds to make call
          let timestamp = Date.now();
          if (timestamp - this.lastChange > 1000) {
            this.lastChange = timestamp;
              this.users.userSearch(data, this.userSearchType).subscribe(res => {
                if(res.length == 0){
                  this.userCtrl.setErrors({'noMatch':true});
                }
                this.foundUsers = this.filterUsers(res, this.usersToFilter);
                this.unresolved = false;
              });
          }else{
            this.unresolved = true;
          }
        }
      }
    )

  }

  ngOnInit(){
    this.usersToFilter.push(this.Auth.getUser());
    setInterval(()=>{
      if(this.unresolved){
          this.users.userSearch(this.userCtrl.value, this.userSearchType).subscribe(res => {
            if(res.length == 0){
              this.userCtrl.setErrors({'noMatch':true});
            }
            this.foundUsers = this.filterUsers(res, this.usersToFilter);
            this.unresolved=false;
          });
      }
    },1000)
  }

}
