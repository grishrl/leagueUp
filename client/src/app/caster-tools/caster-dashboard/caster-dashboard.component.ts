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
    console.log('div ', div, ' round ', round);
    this.filterMatches = this.originalMatches.filter( match=>{
      let pass = false;
      if(div && round){
        console.log('a' )
        if (div == match.divisionConcat && round == match.round){
          pass = true;
        }
      }else if(div){
        console.log('b')
        if (div == match.divisionConcat) {
          pass = true;
        }
      }else if(round){
        console.log('c')
        if (round == match.round) {
          pass = true;
        }
      }else{
        console.log('d')
        pass = true
      }
      return pass;
    } 
    );
  }

  displayTime(ms) {
    console.log(typeof ms);
    let d = new Date(parseInt(ms));
    console.log(d);
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
    console.log('min ', min);
    if (min == 0) {
      minStr = '00';
    } else {
      minStr = min.toString();
    }
    let dateTime = month + '/' + day + '/' + year + ' @ ' + hours + ':' + minStr + " " + suffix;
    return dateTime;
  }

}
