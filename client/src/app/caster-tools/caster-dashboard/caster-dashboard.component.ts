import { Component, OnInit } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { AdminService } from 'src/app/services/admin.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-caster-dashboard',
  templateUrl: './caster-dashboard.component.html',
  styleUrls: ['./caster-dashboard.component.css']
})
export class CasterDashboardComponent implements OnInit {

  constructor( private scheduleService:ScheduleService, private adminService : AdminService) { }

  hideForm = true;
  selectedRound:any
  selectedDivision:any
  originalMatches:any
  filterMatches:any
  rounds=[];
  divisions = []
  ngOnInit() {
    this.adminService.getDivisionList().subscribe((res) => {
      this.divisions = res;
      this.scheduleService.getAllMatches().subscribe(
        (sched) => {
          this.originalMatches = sched;
          this.filterMatches = sched;
          this.filterMatches.forEach(match => {
            match.submitCaster = {
              "name":'',
              "URL":''
            }
            if (this.rounds.indexOf(match.round) < 0) {
              this.rounds.push(match.round);
            }
          });
          this.rounds.sort();
        }
      )
    }, (err) => {
      console.log(err);
    });
  }

  doFilterMatches(div, round){
    
    this.filterMatches = this.originalMatches.filter( match=>{
      let pass = false;
      if(div && round){
        if (div == match.divisionConcat && round == match.round){
          pass = true;
        }
      }else if(div){
        if (div == match.divisionConcat) {
          pass = true;
        }
      }else if(round){ 
        if (round == match.round) {
          pass = true;
        }
      }else{
        pass = true
      }
      return pass;
    } 
    );
  }

  displayTime(ms) {
    let d = new Date(parseInt(ms));
    let day = d.getDate();
    let year = d.getFullYear();
    let month = d.getMonth();
    month = month + 1;
    let hours = d.getHours();
    let suffix = "AM";
    if (hours > 12) {
      hours = hours - 12;
      suffix = "PM";
    }

    let min = d.getMinutes();
    let minStr;
    if (min == 0) {
      minStr = '00';
    } else {
      minStr = min.toString();
    }
    let dateTime = month + '/' + day + '/' + year + ' @ ' + hours + ':' + minStr + " " + suffix;
    return dateTime;
  }

}
