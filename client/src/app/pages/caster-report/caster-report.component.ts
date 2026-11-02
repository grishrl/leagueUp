import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CasterReport } from 'src/app/classes/caster-report';
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

  casterReport:CasterReport = new CasterReport();

  selectedCoCaster = '';
  castersList = [];

  casterSelected(caster, type){
    if(type=='cocaster'){
      if(this.casterReport.coCasters.indexOf(caster.displayName)==-1 && caster.displayName.length>0){
        this.casterReport.coCasters.push(caster.displayName);
        this.casterReport.coCasterIds.push(caster._id);
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
    this.casterReport.coCasterIds.splice(i,1);
  }

  addLink(){
    if(this.casterReport.vodLinks.indexOf(this.vodLink)==-1 && this.vodLink.length>0){
      let validated = this.util.validateVodClip(this.vodLink);
      if(validated.valid){
        this.casterReport.vodLinks.push(this.vodLink);
      }
      this.vodLink='';
    }
  }

  ngOnInit(): void {
      this.AR.paramMap.subscribe(
      params=>{

        this.casterReport.matchId = params['params'].matchId;
        this.casterReport.division =
          params["params"].division != "undefined" ? params["params"].division : null;

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

  selectCoCaster(e){
    this.coCastCtrl.setValue("");
    if(e.option.value){
      this.casterSelected(e.option.value, 'cocaster');
    }
  }

  private _filter(val):Profile[]{

    if( !(val instanceof Object) && !this.util.isNullOrEmpty(val)){
      let filterVal = val.toLowerCase();
      let test = this.castersList.filter((option) =>
        option.displayName.toLowerCase().includes(filterVal)
      );
      return test;
    }else{
      return this.castersList;
    }
  }

  displayFn(val){

    return val && val.displayName ? val.displayName : '';
  }

  saving='';

  save(){
    this.casterReport.casterName = this.Auth.getUser();
    this.casterReport.casterId = this.Auth.getUserId();
    if(this.casterReport.vodLinks.length>0){
      this.saving='Saving..';
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
