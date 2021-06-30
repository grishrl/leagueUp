import { Component, OnInit, Input } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { Profile } from 'src/app/classes/profile.class';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-update-member-info',
  templateUrl: './update-member-info.component.html',
  styleUrls: ['./update-member-info.component.css']
})
export class UpdateMemberInfoComponent implements OnInit {

  constructor(private admin:AdminService, private user:UserService) { }

  returnedProfile = new Profile(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  ngOnInit() {
  }

  @Input() set displayname(val){
    if(val){
      this.user.getUser(val).subscribe(
        res=>{
          this.returnedProfile = res;
        },
        err=>{
          console.warn(err);
        }
      )

    }
  }

  removeTeam() {
    this.admin.removeMembers(this.returnedProfile.teamName, this.returnedProfile.displayName).subscribe(
      res => {
        this.returnedProfile.teamId = null;
        this.returnedProfile.teamName = null;
      },
      err => {
        console.warn(err);
      }
    )
  }

  newTeam(team) {
    this.admin.manualTeamAdd(this.returnedProfile.displayName, team).subscribe(
      res => {
        this.returnedProfile.teamId = res._id;
        this.returnedProfile.teamName = res.teamName;
      },
      err => {
        console.warn(err);
      }
    )

  }

  adminSave() {
    this.admin.saveUser(this.returnedProfile).subscribe(
      res => {

      },
      err => {
        console.warn(err);
      }
    )
  }

}
