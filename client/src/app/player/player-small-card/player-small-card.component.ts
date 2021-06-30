import { Component, OnInit, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';
import { Profile } from '../../classes/profile.class';
import { AuthService } from 'src/app/services/auth.service';
import { TeamService } from 'src/app/services/team.service';
import { ConfirmRemoveMemberComponent } from '../../modal/confirm-remove-member/confirm-remove-member.component';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-player-small-card',
  templateUrl: './player-small-card.component.html',
  styleUrls: ['./player-small-card.component.css']
})
export class PlayerSmallCardComponent implements OnInit {

  constructor(public user: UserService, private Auth: AuthService, private team: TeamService, public dialog: MatDialog) { }

  _captain;
  @Input() set captain(val){
    if(val){
      this._captain = val;
    }

  }

  _teamName
  @Input() set teamName(val){
    if(val){
      this._teamName = val;
    }
  }


  @Input() showTeamLink = false;

  player: Profile = new Profile(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,null);
  matches = 0;
  initPlayer(){
    this.user.getUser(this.displayName).subscribe(
      res=>{
        if(res){
          let count = 0;
          if(res.replayArchive && res.replayArchive.length>0){
            res.replayArchive.forEach(arch=>{
              count+=arch.replays.length;
            })
          }
          count+=res.replays.length;
          this.matches=count;
        }
        this.player=res;

      },
      err=>{
        console.warn(err);
      }
    )
  }

  @Output() playerRemove = new EventEmitter();

  dropEmmiter(x) {
    this.playerRemove.emit(x);
  }

  showRemove(){
    let ret = false;
    if(this._captain){
      if (this._captain == this.displayName) {
        ret = false;
      } else if(this._captain == this.Auth.getUser()){
        ret = true;
      }else{
        ret = false;
      }
    }else{
      ret = false;
    }
    return ret;
  }

  openConfirmRemove(player): void {
    const openConfirmRemove = this.dialog.open(ConfirmRemoveMemberComponent, {
      width: '450px',
      data: { player: player }
    });

    openConfirmRemove.afterClosed().subscribe(result => {
      if (result != undefined && result != null) {
        if (result == 'confirm') {
          this.removeMember(player)
        }

      }
    });
  }

  removeMember(player) {

    if(player && this._teamName){
      this.team.removeUser(player, this._teamName).subscribe(
        (res) => {

          //if the user left the group, destroy their team local info so they can carry on
          if (this.Auth.getUser() == player) {
            this.Auth.destroyTeam();
            this.Auth.destroyTeamId();
          }
          this.dropEmmiter(player)
        },
        (err) => {
          console.warn(err);
        }
      )
    }

    }

  showLeave() {
    let ret = false;
    if (this._captain) {
      if (this._captain == this.displayName) {
        ret = false;
      } else {
        ret = this.Auth.getUser() == this.displayName;
      }
    } else {
      ret = this.Auth.getUser() == this.displayName;
    }
    return ret;
  }


  displayName: string;
  @Input() set playerID(val) {
    this.displayName = val;
    this.initPlayer();
  }

  ngOnInit() {
  }

  }
