import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

import { UserService } from '../services/user.service';



@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit {

  usersToFilter: any[] = [];
  priorSelect: any
  lastChange: number = 0;
  selectedUser:any
  btnTxt:string
  cantClick:boolean = false;

  disableButton() {

    if (this.priorSelect != undefined && this.priorSelect != null
      || this.selectedUser != null && this.selectedUser != undefined) {
      if (this.priorSelect == this.selectedUser) {

        return true;
      } else {
   
        return false;
      }
    } else {

      return false;
    }
  }

  @Output() userSelected = new EventEmitter();

  userSelect(user){
    this.priorSelect = user;
    this.userSelected.emit(user);
  }

  @Input() set buttonText(text){
    if(text!=undefined&&text!=null){
      this.btnTxt = text;
    }else{
      this.btnTxt = "Seach";
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
    console.log('master ', master, 'remove ', remove)
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

  constructor(private users: UserService) {
    this.userCtrl.valueChanges.subscribe(
      data => {
        if(data && data.length>2){
          //give this a delay so we don't swamp the server with calls! .875 seconds to make call
          let timestamp = Date.now();
          if (timestamp - this.lastChange > 1000) {
            this.lastChange = timestamp;
            this.users.userSearch(data).subscribe(res => {
              this.foundUsers = this.filterUsers(res, this.usersToFilter);
            });
          }
        }


      }
    )

  }

  ngOnInit(){
  
  }

}
