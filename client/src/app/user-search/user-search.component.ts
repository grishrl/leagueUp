import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { UserService } from '../services/user.service';
import { last } from '@angular/router/src/utils/collection';
import { TeamService } from '../services/team.service';


@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit {

  usersToFilter: any[]
  recTeam: string

  lastChange: number = 0;

  @Input() set filterUser(users){
    if(users != null && users != undefined && users.length>0){
      this.usersToFilter = users;
    }else{
      this.usersToFilter = []
    }
  }

  @Input() set passedTeam(team) {
    if (team != null && team != undefined && team.length > 0) {
      this.recTeam = team;
    }
  }
  message:string

  invite(user){
    if (this.recTeam && user){
      this.team.addUser(user,this.recTeam).subscribe(res=>{
        this.message = res.message;
      }, err=>{
        this.message = err.error.message;
      });
    }
    
  }



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

  constructor(private users: UserService, private team: TeamService) {
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
