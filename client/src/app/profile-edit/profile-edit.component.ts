import { Component, OnInit, NgModule } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TimezoneService } from '../services/timezone.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { Profile } from '../classes/profile.class';
import { Observable, Subscription } from 'rxjs';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { merge } from 'lodash';
import { HotsLogsService } from '../services/hots-logs.service';

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

  formControl = new FormControl('',
  [Validators.required]);

  answers: Object;
  selectedMedal: String;
  displayName : string;
  profileObs : Observable<Profile>;
  returnedProfile = new Profile(null,null,null,null,null);

  dataRet = false;
  profSub: Subscription;
  tempProfile: Profile;

  editOn = true;

  hlMedals = ['Grand Master','Master','Diamond','Platinum','Gold','Silver','Bronze'];
  hlDivision = [1,2,3,4,5];
  competitonLevel = [
    'Low','Medium','High'
  ]
  
  constructor(public timezone : TimezoneService, private user : UserService, public auth : AuthService, private route : ActivatedRoute, private hotsLogsService: HotsLogsService ) {
    this.displayName = user.realUserName(this.route.snapshot.params['id']);
   }

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
     this.tempProfile = Object.assign({}, this.returnedProfile);
   }

   cancel(){
     this.returnedProfile = Object.assign({}, this.tempProfile);
     this.editOn = true;
   }

   save(){
     if(this.validate()){
       if (!this.isNullOrEmpty(this.returnedProfile.lfgDetails.hotsLogsURL)){
         this.hotsLogsService.getMMR(this.returnedProfile.lfgDetails.hotsLogsURL).subscribe(res => {
           console.log(res);
           this.returnedProfile.lfgDetails.averageMmr = res;
           this.user.saveUser(this.returnedProfile).subscribe((res) => {
             if (res) {
               this.editOn = true;
             } else {
               alert("error");
             }
           });
         });
       }else{
         this.user.saveUser(this.returnedProfile).subscribe((res) => {
           if (res) {
             this.editOn = true;
           } else {
             alert("error");
           }
         });
       }
     }else{
       
       console.log('the data was invalid we cant save');
     }
   }

  ngOnInit() {    
    console.log('new  ', this.returnedProfile);
    this.profSub = this.user.getUser(this.displayName).subscribe((res) => { 
      merge(this.returnedProfile, res);
      console.log('this.returnedProfile ', this.returnedProfile)
      } )
  }

  validate(){
    let valid = true;
    //validate the hotslogs URL
    if (this.isNullOrEmpty(this.returnedProfile.lfgDetails.hotsLogsURL) ||
      this.returnedProfile.lfgDetails.hotsLogsURL.indexOf('https://www.hotslogs.com/Player/Profile?PlayerID=') == -1){
      valid = false;
    }

    //validate the hero leauge information
    if(this.isNullOrEmpty(this.returnedProfile.lfgDetails.heroLeague)){
      valid = false;
    }

    //validate looking for team:
    if (this.isNullOrEmpty(this.returnedProfile.lookingForGroup)) {
      valid = false;
    }

    //will we require the comp level, play history, roles?

    //validate that we have start and end times for available days
    for (let day in this.returnedProfile.lfgDetails.availability){
      let checkDay = this.returnedProfile.lfgDetails.availability[day];
      if (checkDay.available){
        console.log('the times S, E', checkDay.startTime, checkDay.endTime )
        if (checkDay.startTime == null && checkDay.endTime == null){
          return false;
        }else if (checkDay.startTime.length == 0 && checkDay.endTime.length == 0){
          return false;
        }
      }
    }

    //ensure time zone
    if (this.isNullOrEmpty(this.returnedProfile.lfgDetails.timeZone)) {
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
