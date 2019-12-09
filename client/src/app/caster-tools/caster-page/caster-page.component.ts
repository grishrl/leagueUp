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

  upcomingList = new Map<String, [object]>();
  pastList = new Map<String, [object]>();
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

    this.upcomingList = new Map<String, [object]>();
    this.scheduleService.getMyCastedMatches().subscribe(
      res=>{
        let now = Date.now();
        res = this.util.sortMatchesByTime(res);
        res.forEach(match=>{
          if (now <= match.scheduledTime.startTime) {
            let formatDate = this.util.getFormattedDate(match.scheduledTime.startTime, 'dddd MMM D hh:mm');
            if (this.upcomingList.has(formatDate)) {
              let tempArr = this.upcomingList.get(formatDate);
              tempArr.push(match);
              this.upcomingList.set(formatDate, tempArr);
              // this.list[formatDate].push(match);
            } else {
              this.upcomingList.set(formatDate, [match]);
            }
          }else{
            let thirtyDaysInMs = 2592000000;
            let thirtdayDaysAgo = now - thirtyDaysInMs;
            if (match.scheduledTime.startTime > thirtdayDaysAgo){
              let formatDate = this.util.getFormattedDate(match.scheduledTime.startTime, 'dddd MMM D hh:mm');
              if (this.pastList.has(formatDate)) {
                let tempArr = this.pastList.get(formatDate);
                tempArr.push(match);
                this.pastList.set(formatDate, tempArr);
                // this.list[formatDate].push(match);
              } else {
                this.pastList.set(formatDate, [match]);
              }
            }

          }
        });
      },
      err=>{
        console.log(err);
      }
    )
  }

}
