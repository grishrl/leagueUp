import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { TeamService } from 'src/app/services/team.service';
import { Profile } from '../../../classes/profile.class';
import { Team } from '../../../classes/team.class';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-approve-member-view',
  templateUrl: './approve-member-view.component.html',
  styleUrls: ['./approve-member-view.component.css']
})

export class ApproveMemberViewComponent implements OnInit {
  _info:any
  
  @Input() set info(info){
    if(info!=null&&info!=undefined){
      this._info = info;
    }
  }

  @Output() accountActioned = new EventEmitter();

  constructor(private user:UserService, private team:TeamService, private admin:AdminService) { }

  hidePanel:boolean = true;

  player = new Profile(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  viewTeam = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  resultantMmr:number

  ngOnInit() {
    if(this._info.teamName && this._info.userName){
      this.user.getUser(this._info.userName).subscribe( res =>{
        this.player = res;
      });
      this.team.getTeam(this._info.teamName).subscribe(resT=>{
        this.viewTeam = resT;
        // console.log('this.player.averageMmr && this.viewTeam.teamMMRAvg', this.player.averageMmr, this.viewTeam.teamMMRAvg)
        if (this.player.averageMmr && this.viewTeam.teamMMRAvg) {
          this.resultantMmr = Math.round((this.player.averageMmr + this.viewTeam.teamMMRAvg) / 2);
        }
      })
    }

  }

  accountActioner(){
    this.accountActioned.emit(this._info);
  }


  actionAccount(act){
    
    let answer = {
      "teamName":this.viewTeam.teamName,
      "member":this.player.displayName,
      "approved":act
    };
    this.admin.queuePost(answer).subscribe( res =>{
      this.accountActioner();
    }, err=>{
      console.log(err);
    });
  }

}
