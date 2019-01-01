import { Component, OnInit, NgModule, Inject, Input} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { TimezoneService } from '../services/timezone.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { Profile } from '../classes/profile.class';
import { Observable, Subscription } from 'rxjs';
import { ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { merge } from 'lodash';
import { HotsLogsService } from '../services/hots-logs.service';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';

@NgModule({
  imports:[
    ReactiveFormsModule
  ]
})

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {

  constructor(public timezone: TimezoneService, private user: UserService, public auth: AuthService, private router: Router, private route: ActivatedRoute, private hotsLogsService: HotsLogsService, public dialog: MatDialog) {
    this.displayName = user.realUserName(this.route.snapshot.params['id']);
  }

  editOn = true;

  hotsLogsFormControl = new FormControl({value:'',disabled:true} ,[
    Validators.required,
    this.hotslogsUrlPatternValidator
  ]);

  heroeLeagueDivisionControl = new FormControl({ value: '',disabled:true}, [
    Validators.required
  ]);

  heroeLeagueRankControl = new FormControl({ value: '', disabled: true }, [
    Validators.required
  ]);

  timezoneControl = new FormControl({ value: '', disabled: true }, [
    Validators.required
  ]);

  hotslogsUrlPatternValidator(control: FormControl) {
  let hotslogsURL = control.value;
    let regex = new RegExp(/^((https):\/)\/www\.hotslogs\.com\/player\/profile\?playerid\=[0-9]+/, 'i');
    if (regex.test(hotslogsURL)) {
      return null;
  }else{
      return {
        invalidurl:true
        }
      };
  }

  profileForm = new FormGroup({
    hotslogurl: this.hotsLogsFormControl,
    hlDivision: this.heroeLeagueDivisionControl,
    hlRank: this.heroeLeagueRankControl,
    timezone: this.timezoneControl
  })

  formControlledEnable(){
this.hotsLogsFormControl.enable();
this.heroeLeagueDivisionControl.enable();
this.heroeLeagueRankControl.enable();
this.timezoneControl.enable();
  }

  formControlledDisable(){
    this.hotsLogsFormControl.disable();
    this.heroeLeagueDivisionControl.disable();
    this.heroeLeagueRankControl.disable();
    this.timezoneControl.disable();
  }

  providedProfile:string;
  @Input() set passedProfile(profile){
    if(profile!=null&&profile!=undefined){
      this.providedProfile = profile;
    }
  }

  confirm: string

  openDialog(): void {
    
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '300px',
      data: { confirm: this.confirm }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.toLowerCase()=='delete'){
        this.user.deleteUser().subscribe(
          res =>{
          this.auth.destroyAuth();
          this.router.navigate(['']);
         },err=>{
            console.log(err);
          }
        )
      }
    });
  }

  formControl = new FormControl('',
  [Validators.required]);

  answers: object;
  selectedMedal: string;
  displayName : string;
  profileObs : Observable<Profile>;
  returnedProfile = new Profile(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

  dataRet = false;
  profSub: Subscription;
  tempProfile: Profile;

  hlMedals = ['Grand Master','Master','Diamond','Platinum','Gold','Silver','Bronze'];
  hlDivision = [1,2,3,4,5];
  competitonLevel = [
    'Low','Medium','High'
  ]
  

   hideDay(editSwitch, dayAvailabilty): boolean {
     if (!editSwitch){
      return false;
     }else{
       if(dayAvailabilty){
         return false;
       }else{
         return true;
       }
     }
   }

   openEdit(){
     this.editOn=false;
     this.formControlledEnable();
     this.tempProfile = new Profile(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
     merge(this.tempProfile, this.returnedProfile);
   }

   cancel(){
     this.returnedProfile = Object.assign({}, this.tempProfile);
     this.editOn = true;
     this.formControlledDisable();
   }

   save(){
     if(this.validate()){
       if (!this.isNullOrEmpty(this.returnedProfile.hotsLogsURL)){
         this.hotsLogsService.getMMR(this.returnedProfile.hotsLogsURL).subscribe(res => {
           if (res != 'error') {
             this.returnedProfile.averageMmr = res;
             this.user.saveUser(this.returnedProfile).subscribe((res) => {
               if (res) {
                 this.editOn = true;
                 this.hotsLogsFormControl.disable()
               } else {
                 alert("error");
               }
             });
            }else{
              alert('We could not validate your hots logs, please recheck the URL!');
              this.cancel();
            }

         });
       }else{
         this.user.saveUser(this.returnedProfile).subscribe((res) => {
           if (res) {
             this.editOn = true;
             this.formControlledDisable();
           } else {
             alert("error");
           }
         });
       }
     }else{
       //todo: do something?
       console.log('the data was invalid we cant save');
     }
   }

  ngOnInit() {    
    let getProfile:string;
    if(this.providedProfile){
      getProfile = this.providedProfile;
    }else if(this.displayName){
      getProfile = this.displayName;
    }
    this.profSub = this.user.getUser(getProfile).subscribe((res) => { 
      merge(this.returnedProfile, res);
      } )
  }

  validate(){
    let valid = true;
    //validate the hotslogs URL
    if (this.isNullOrEmpty(this.returnedProfile.hotsLogsURL) ||
      this.returnedProfile.hotsLogsURL.indexOf('https://www.hotslogs.com/Player/Profile?PlayerID=') == -1){
      valid = false;
    }

    //validate the hero leauge information
    //TODO: Check that this is in the validation!
    if (this.isNullOrEmpty(this.returnedProfile.hlRankMetal) && this.isNullOrEmpty(this.returnedProfile.hlRankDivision)){
      valid = false;
    }

    //validate looking for team:
    if (this.isNullOrEmpty(this.returnedProfile.lookingForGroup)) {
      valid = false;
    }

    //will we require the comp level, play history, roles?

    //validate that we have start and end times for available days
    for (let day in this.returnedProfile.availability){
      let checkDay = this.returnedProfile.availability[day];
      if (checkDay.available){
        if (checkDay.startTime == null && checkDay.endTime == null){
          return false;
        }else if (checkDay.startTime.length == 0 && checkDay.endTime.length == 0){
          return false;
        }
      }
    }

    //ensure time zone
    if (this.isNullOrEmpty(this.returnedProfile.timeZone)) {
      valid = false;
    }

    return valid;
  }

  isNullOrEmpty( dat ) : boolean {
    if(dat == null || dat == undefined){
      return true;
    }
    if(Array.isArray(dat)){
      if(dat.length==0){
        return true;
      }
    }else if( typeof dat == 'object' ){
      let noe = false;
      for(let key in dat){
        if(this.isNullOrEmpty(dat[key])){
          noe = true;
        }
      }
      return noe;
    }else if(typeof dat == "string"){
      return dat.length==0;
    }else{
      return false;
    }
  }

  ngOnDestroy(){
    this.profSub.unsubscribe();
  }
}


//!!!-------------------------------!!!
//component for the modal!!!! 
export interface DialogData {
  confirm: string;
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
})
export class DialogOverviewExampleDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
