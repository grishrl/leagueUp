import { Component, OnInit, Input } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Profile } from '../../classes/profile.class';

@Component({
  selector: 'app-player-small-card',
  templateUrl: './player-small-card.component.html',
  styleUrls: ['./player-small-card.component.css']
})
export class PlayerSmallCardComponent implements OnInit {

  constructor(public user:UserService) { }

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

        //todo: maybe include all matches?
      },
      err=>{
        console.log(err);
      }
    )
  }

  displayName:string;
  @Input() set playerID(val){
    this.displayName = val;
    this.initPlayer();
  }

  ngOnInit() {
  }

}
