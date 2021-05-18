import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-caster-report',
  templateUrl: './caster-report.component.html',
  styleUrls: ['./caster-report.component.css']
})
export class CasterReportComponent implements OnInit {

  constructor(private Auth:AuthService, private User:UserService, private ScheduleService:ScheduleService,
    private AR:ActivatedRoute) { }

  displayNameControl=new FormControl();

  casterReport = {
    casterName:'',
    coCasters:[],
    matchId:'',
    division:'',
    vodLinks:[],
    issues:'',
    season:1
  };

  selectedCoCaster = '';
  castersList = [];

  casterSelected(caster, type){
    if(type=='cocaster'){
      console.log('caster', caster);
      if(this.casterReport.coCasters.indexOf(caster)==-1 && caster.length>0){
        this.casterReport.coCasters.push(caster);
      }
      // let ind = -1;
      // this.casterReport.coCasters.forEach(v=>{
      //   if(v.displayName == caster.displayName){
      //     ind = 11
      //   }
      // });
      // if(ind==-1){
      //   this.casterReport.coCasters.push(caster);
      //   console.log(this.casterReport);
      // }
    }
  }

  vodLink='';

  removeVod(e){
    let i = this.casterReport.vodLinks.indexOf(e);
    this.casterReport.vodLinks.splice(i, 1);
  }

  removecoCaster(e){
    let i = this.casterReport.coCasters.indexOf(e);
    this.casterReport.coCasters.splice(i, 1);
  }

  addLink(){
    if(this.casterReport.vodLinks.indexOf(this.vodLink)==-1 && this.vodLink.length>0){
      this.casterReport.vodLinks.push(this.vodLink);
      this.vodLink='';
    }
  }

  ngOnInit(): void {
      this.AR.paramMap.subscribe(
      params=>{
        console.log('params', params);
        this.casterReport.matchId = params['params'].matchId;
        this.casterReport.division = params['params'].division;
        console.log(this.casterReport);
      }
    )
    this.casterReport.casterName = this.Auth.getUser();

    this.User.getCasters().subscribe(
      casters=>{
        console.log('casters', casters);
        this.castersList = casters;
      },
      err=>{
        console.warn(err);
      }
    )

  }

}
