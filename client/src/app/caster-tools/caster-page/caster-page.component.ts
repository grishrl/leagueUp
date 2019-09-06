import { Component, OnInit } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { Profile } from 'src/app/classes/profile.class';

@Component({
  selector: 'app-caster-page',
  templateUrl: './caster-page.component.html',
  styleUrls: ['./caster-page.component.css']
})
export class CasterPageComponent implements OnInit {

  constructor(private scheduleService: ScheduleService, public util: UtilitiesService, public teamServ:TeamService, private user:UserService, private auth:AuthService ) { }

  list = new Map<String, [object]>();
  seasonVal;

  asIsOrder(a, b) {
    return 1;
  }

  returnedProfile = new Profile(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

  edit=false;

  save(){
    this.user.saveUser(this.returnedProfile).subscribe(
      res=>{
        this.edit = false;
      },
      err=>{
        console.log(err);
      }
    )

  }

  ngOnInit() {
    this.user.getUser(this.auth.getUser()).subscribe((res) => {
      this.returnedProfile = res;
    });

    this.list = new Map<String, [object]>();
    this.scheduleService.getMyCastedMatches().subscribe(
      res=>{
        console.log(res);
        let now = Date.now()
        res.forEach(match=>{

          // if (now <= match.scheduledTime.startTime){
          //   let formatDate = this.util.getFormattedDate(match.scheduledTime.startTime, 'dddd MMM D');
          //   if (this.list.hasOwnProperty(formatDate)) {
          //     this.list[formatDate].push(match);
          //   } else {
          //     this.list[formatDate] = [match];
          //   }
          // }
          if (now <= match.scheduledTime.startTime) {
            let formatDate = this.util.getFormattedDate(match.scheduledTime.startTime, 'dddd MMM D');
            console.log(formatDate);
            if (this.list.has(formatDate)) {
              let tempArr = this.list.get(formatDate);
              tempArr.push(match);
              this.list.set(formatDate, tempArr);
              // this.list[formatDate].push(match);
            } else {
              this.list.set(formatDate, [match]);
            }
          }

        });
        console.log(this.list);
      },
      err=>{
        console.log(err);
      }
    )
  }

}
