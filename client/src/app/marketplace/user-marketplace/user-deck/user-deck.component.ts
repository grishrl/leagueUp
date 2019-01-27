import { Component, OnInit, Input } from '@angular/core';
import { DivisionService } from 'src/app/services/division.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { TimezoneService } from 'src/app/services/timezone.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';
import { RequestService } from 'src/app/services/request.service';

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

  constructor(private divisionService: DivisionService, private auth: AuthService, public _userService: UserService, public timezone: TimezoneService, private util: UtilitiesService, public _team: TeamService,
    private request: RequestService) { }

  ngOnInit() {
    this.showInviteButton(this.player);
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

  showInvButton:string;

  showInviteButton(player) {
    
    if (this.teamInfo) {
      if (this.teamInfo.invitedUsers) {
        if (this.teamInfo.invitedUsers.indexOf(player.displayName) > -1) {
          this.showInvButton = 'invited';
        } else {
          this.showInvButton = 'notinvited';
        }
      }else{
        this.showInvButton = 'notinvited';
      } 
    } else {
      this.showInvButton = 'noteam';
    }
  }

}
