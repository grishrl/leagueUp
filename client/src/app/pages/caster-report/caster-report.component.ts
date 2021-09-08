import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Profile } from 'src/app/classes/profile.class';
import { AuthService } from 'src/app/services/auth.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UserService } from 'src/app/services/user.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-caster-report',
  templateUrl: './caster-report.component.html',
  styleUrls: ['./caster-report.component.css']
})
export class CasterReportComponent implements OnInit {

  constructor(private Auth:AuthService, private User:UserService, private ScheduleService:ScheduleService,
    private AR:ActivatedRoute, private router:Router, private util:UtilitiesService) { }

  displayNameControl=new FormControl();

  coCastCtrl = new FormControl();
  filteredOptions: Observable<Profile[]>;

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
      if(this.casterReport.coCasters.indexOf(caster)==-1 && caster.length>0){
        this.casterReport.coCasters.push(caster);
      }
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
      let validated = this.util.validateClipUrl2(this.vodLink);
      if(validated.valid){
        this.casterReport.vodLinks.push(this.vodLink);
      }
      this.vodLink='';
    }
  }

  ngOnInit(): void {
      this.AR.paramMap.subscribe(
      params=>{
        // console.log('params', params);
        this.casterReport.matchId = params['params'].matchId;
        this.casterReport.division = params['params'].division;
        // console.log(this.casterReport);
        //get report if it exists
        this.ScheduleService.getCasterReport(this.casterReport.matchId).subscribe(
          res=>{
            if(res){
            this.casterReport = res;
            }
          },
          err=>{
            console.warn(err);
          }
        )
      }
    );
    this.casterReport.casterName = this.Auth.getUser();

    this.User.getCasters().subscribe(
      casters=>{

        this.castersList = casters;
        this.castersList = this.castersList.sort( (a,b)=>{
          return a.displayName < b.displayName ? -1:1;
        })
        this.filteredOptions = this.coCastCtrl.valueChanges.
    pipe(
        startWith(''),
        map(value => this._filter(value))
      );
      },
      err=>{
        console.warn(err);
      }
    )

  }

  select(e){
    if(e.option.value){
      this.casterSelected(e.option.value, 'cocaster');
    }
  }

  private _filter(val):Profile[]{
    if(val !== undefined){
      let filterVal = val.toLowerCase();
      return this.castersList.filter(option=>option.displayName.toLowerCase().includes(filterVal));
    }
  }

  saving='';

  save(){
    this.saving='Saving..';
    if(this.casterReport.vodLinks.length>0){
      this.ScheduleService.casterReport(this.casterReport).subscribe(
        res=>{
          this.saving='Completed';
          this.router.navigate(["_casterPage"]);
        },
        err=>{
          this.saving='';
          console.warn(err);
        }
      )
    }
  }

}
