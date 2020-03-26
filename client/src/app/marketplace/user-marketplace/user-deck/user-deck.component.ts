import { Component, OnInit, Input } from '@angular/core';
import { DivisionService } from 'src/app/services/division.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { TimezoneService } from 'src/app/services/timezone.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';
import { RequestService } from 'src/app/services/request.service';
import { HotsLogsService } from 'src/app/services/hots-logs.service';
import { HeroesProfileService } from 'src/app/services/heroes-profile.service';

@Component({
  selector: 'app-user-deck',
  templateUrl: './user-deck.component.html',
  styleUrls: ['./user-deck.component.css']
})
export class UserDeckComponent implements OnInit {

  player:any
  @Input() set recPlayer(_player){
    if(_player){
      this.player = _player;
    }
  }

  teamInfo: any
  @Input() set recTeamInfo(_team) {
    if (_team) {
      this.teamInfo = _team;
    }
  }

  hpLink;

  constructor(public hotsLogsService:HotsLogsService, private divisionService: DivisionService, private auth: AuthService, public _userService: UserService, public timezone: TimezoneService, private util: UtilitiesService, public _team: TeamService,
    private request: RequestService, public heroprofile:HeroesProfileService) { }

  ngOnInit() {
    this.showInviteButton(this.player);
  }

  showInvButton(){
    let ret = true;
    if(this.player){
      if(this.player.invited){
        ret = false;
      }else if(this.player.teamName || this.player.teamId){
        ret = false;
      }else if (this.player.pendingTeam){
        ret = false;
      }else if(
        this.invitedStatus == 'invited'
      ){
        return false;
      }
    }
    return ret;
  }

  requestToJoin(player) {
    this.request.inviteToTeamRequest(this.auth.getTeam(), player.displayName).subscribe(
      (res) => {
        this.teamInfo.invitedUsers.push(player.displayName);
        this.showInviteButton(player);
        //filter by pending invites?
      }, err => {
        console.log(err);
      }
    )
  }

  rosterFull() {
    let roster = 0;
    if (this.teamInfo) {
      if (this.teamInfo.teamMembers) {
        roster += this.teamInfo.teamMembers.length;
        if (this.teamInfo.pendingMembers) {
          roster += this.teamInfo.pendingMembers.length;
        }
      }
    }
    return roster >= 9;
  }

  invitedStatus:string;

  showInviteButton(player) {
    if (this.teamInfo) {
      if (this.teamInfo.invitedUsers) {
        if (this.teamInfo.invitedUsers.indexOf(player.displayName) > -1) {
          this.invitedStatus = 'invited';
        } else {
          this.invitedStatus = 'notinvited';
        }
      }else{
        this.invitedStatus = 'notinvited';
      }
    } else if (this.invitedStatus == 'invited'){
    }else{
      this.invitedStatus = 'noteam';
  }
  }


}
