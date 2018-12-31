import { Component, OnInit, Input} from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialogOverviewExampleDialog } from '../profile-edit/profile-edit.component';
import { ChangeCaptainModalComponent } from '../modal/change-captain-modal/change-captain-modal.component';
import { TimezoneService } from '../services/timezone.service';
import { TeamService } from '../services/team.service';
import { ActivatedRoute, Router } from '@angular/router';
import { merge } from 'lodash';
import { Team } from '../classes/team.class';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { AdminService } from '../services/admin.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-team-profile',
  templateUrl: './team-profile.component.html',
  styleUrls: ['./team-profile.component.css']
})
export class TeamProfileComponent implements OnInit {

  //these properties are used for inputs
  editOn: boolean = true;
  teamName: string;
  displayDivision: string = ""
  returnedProfile = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  filterUsers: any[] = []
  tempProfile
  message: string
  showMe:boolean = true;
  errorAvail:boolean = false;

  hlMedals = ['Grand Master', 'Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'];
  hlDivision = [1, 2, 3, 4, 5];
  competitonLevel = [
    { val: 1, display: 'Low' },
    { val: 3, display: 'Medium' },
    { val: 5, display: 'High' }
  ]

  //constructor
  constructor(private auth: AuthService, private user: UserService, public timezone: TimezoneService, private team: TeamService, private route: ActivatedRoute, public dialog: MatDialog, private router: Router,
    private admin:AdminService) {
    this.teamName = team.realTeamName(this.route.snapshot.params['id']);
  }


  timezoneControl = new FormControl({ value: '', disabled: true }, [
    Validators.required
  ]);

  formControlledEnable() {
    this.timezoneControl.enable();
  }

  formControlledDisable() {
    this.timezoneControl.disable();
  }

  //init implementation
  ngOnInit() {
    let getProfile: string;
    console.log('typeof this.providedProfile: ', typeof this.providedProfile);
    console.log('his.providedProfile: ', this.providedProfile);
    if (this.providedProfile != null && this.providedProfile != undefined) {
      if (typeof this.providedProfile == 'string') {
        getProfile = this.providedProfile;
        this.getTeamByString(getProfile);
      } else {
        merge(this.returnedProfile, this.providedProfile);
        this.setUpTeamMemberFilter(this.returnedProfile);
        this.orignalName = this.returnedProfile.teamName_lower;
        // this.cleanUpDivision();
      }
    } else {
      getProfile = this.teamName;
      this.getTeamByString(getProfile);
    }
  }

  setUpTeamMemberFilter(teamProfile){
    if (teamProfile.teamMembers && teamProfile.teamMembers.length > 0) {
      teamProfile.teamMembers.forEach(element => {
        this.filterUsers.push(element['displayName']);
      });
    }
    console.log('teamProfile ',teamProfile);
    if (teamProfile.pendingMembers && teamProfile.pendingMembers.length > 0) {
      teamProfile.pendingMembers.forEach(element => {
        this.filterUsers.push(element['displayName']);
      });
    }
  }

  //this boolean will keep up with wether the component is embedded in another or is acting as it's own standalone page
  componentEmbedded: boolean = false;
  //if this component is used in the admin view the team name can be changed, we must hold on to the old team name to update the proper object
  orignalName:string = null;
  
  // this model change method will be bound to the name change input, so we can update the lower case name along with the display name
  modelChange() {
    console.log('model change');
    console.log('this.returnedProfile.teamName ', this.returnedProfile.teamName);
    console.log('this.returnedProfile.teamName_lower ', this.returnedProfile.teamName_lower);
    if (this.returnedProfile.teamName != this.returnedProfile.teamName_lower) {
      this.returnedProfile.teamName_lower = this.returnedProfile.teamName.toLowerCase();
    }
  }

  //provided profile holds anything bound to the component when it's embedded
  providedProfile: any;
  //passedProfile binding for when this component is embedded
  @Input() set passedProfile(profile) {
    if (profile != null && profile != undefined) {
      this.providedProfile = profile;
      //if we received a profile; the component is embedded:
      this.componentEmbedded = true;
      this.editOn = false;
      this.formControlledEnable();
      
      this.ngOnInit();
    }
  }

  embedSource:string='';
  @Input() set source(_source){
    this.embedSource = _source;
  } 


  //this method controls the opening of the change captain modal
  openCaptainChangeDialog():void{
    const changeCptDialogRef = this.dialog.open(ChangeCaptainModalComponent, {
      width:'450px',
      data:{members:this.returnedProfile.teamMembers, captain:this.returnedProfile.captain}
    });

    changeCptDialogRef.afterClosed().subscribe( result => {
        if(result!=undefined&&result!=null){

          this.team.changeCaptain(this.returnedProfile.teamName_lower,result).subscribe(
            (res)=>{
              this.auth.destroyCaptain();
              this.ngOnInit();
            },
            (err)=>{
              console.log(err)
            }
          )
        }
    });
  }

  //this method opens the admin change captain modal
  openAdminCaptainChangeDialog():void{
    const dialogRef = this.dialog.open(ChangeCaptainModalComponent, {
      width: '450px',
      data: { members: this.returnedProfile.teamMembers, captain: this.returnedProfile.captain }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null && result != undefined) {
        this.admin.changeCaptain(this.returnedProfile.teamName_lower, result).subscribe((res) => {
          this.returnedProfile = null;
          this.returnedProfile = res;
        }, (err) => {
          console.log(err);
        })
      }
    });
  }

  openAdminDeleteDialog():void{
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '300px',
      data: { confirm: this.confirm }
    });

    dialogRef.afterClosed().subscribe(result => {


      if (result.toLowerCase() == 'delete') {

        this.admin.deleteTeam(this.returnedProfile.teamName_lower).subscribe(
          res => {
            this.showMe = false;
          }, err => {
            console.log(err);
          }
        )
      }
    });
  }

  //this method constorls the opening of the delete team confirm modal
  confirm: string
  openDialog(): void {

    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '300px',
      data: { confirm: this.confirm }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

      if (result.toLowerCase() == 'delete') {
        console.log('delete this account!');
        this.team.deleteTeam(this.returnedProfile.teamName_lower).subscribe(
          res => {
            this.returnedProfile = null;
            this.auth.destroyTeam();
            this.auth.destroyCaptain();
            this.router.navigate(['/profile',this.user.routeFriendlyUsername(this.auth.getUser())]);
          }, err => {
            console.log(err);
          }
        )
      }
    });
  }

  adminSave(){
    if (this.validate()) {
      this.editOn = true;
      this.formControlledDisable();
      let cptRemoved = Object.assign({}, this.returnedProfile);
      delete cptRemoved.captain;
      this.admin.saveTeam(this.orignalName,this.returnedProfile).subscribe((res) => {
        console.log('team was saved!');
        this.orignalName = res.teamName_lower;
        this.returnedProfile = res;
      }, (err) => {
        console.log(err);
        alert(err.message);
      });
    } else {
      //activate validator errors
      console.log('the data was invalid')
    }
  }

  //this method enables form inputs for changes
  openEdit(){
    this.editOn=false;
    this.formControlledEnable();
    this.tempProfile = Object.assign({}, this.returnedProfile);
  } 

  //this method resets the profile back to pre-edit state and disables inputs for changes
  cancel() {
    this.returnedProfile = Object.assign({}, this.tempProfile);
    this.editOn = true;
    this.formControlledDisable();
  }

  //this method checks that the inputs are valid and if so, saves the team object
  save() {
    if (this.validate()) {
      this.editOn = true;
      this.formControlledDisable();
      let cptRemoved = Object.assign({}, this.returnedProfile);
      delete cptRemoved.captain;
      this.team.saveTeam(cptRemoved).subscribe((res) => {
        this.editOn = true;
        this.formControlledDisable();
      }, (err) => {
        console.log(err);
        alert(err.message);
      });
    } else {
      //activate validator errors
      console.log('the data was invalid')
    }

  }

  //method for inviting users to join this team
  invite(user) {
    console.log(user);
    if (this.returnedProfile.teamName && user) {
      this.team.addUser(user, this.returnedProfile.teamName_lower).subscribe(res => {
        this.message = res.message;
        this.filterUsers.push(user);
        console.log(this.filterUsers);
      }, err => {
        this.message = err.error.message;
      });
    }
  }

  //method takes in the factors at hand to show the captain edit options or the admin edit options
  showEditDialog(){
    if(this.embedSource == 'admin'){
      return false;
    }else{
      let isteamcpt;
      if (this.auth.getCaptain()) {
        isteamcpt = this.auth.getUser() === this.returnedProfile.captain;
      }
      return isteamcpt;
    }
  }


  //method hides or shows days based on whether the team is available or not, and shows all in edit mode.
  hideDay(editSwitch, dayAvailabilty): boolean {
    if (!editSwitch) {
      return false;
    } else {
      if (dayAvailabilty) {
        return false;
      } else {
        return true;
      }
    }
  }


  //helper function of dubious helpfulness.
  isNullOrEmpty(dat): boolean {
    if (dat == null || dat == undefined) {
      return true;
    }
    if (Array.isArray(dat)) {
      if (dat.length == 0) {
        return true;
      }
    } else if (typeof dat == 'object') {
      let noe = false;
      for (let key in dat) {
        if (this.isNullOrEmpty(dat[key])) {
          noe = true;
        }
      }
      return noe;
    } else if (typeof dat == "string") {
      return dat.length == 0;
    } else {
      return false;
    }
  }

  //method to validate the inputs we require.
  validate() {

    let valid = true;
    if (this.checkAvailabilityDays()){
      valid = true;
      this.errorAvail = false;
    }else{
      valid = false;
      this.errorAvail = true;
    }
    
    //ensure time zone
    if (this.isNullOrEmpty(this.returnedProfile.timeZone)) {
      valid = false;
      this.timezoneControl.setErrors({required:true});
    }else{
      this.timezoneControl.setErrors(null);
    }
    
    return valid;
  }

  checkAvailabilityDays(): boolean {
    let ret = true;
    let nodays = 0;
    if (this.returnBoolByPath(this.returnedProfile, 'availability')) {
      //validate that we have start and end times for available days
      for (let day in this.returnedProfile.availability) {
        let checkDay = this.returnedProfile.availability[day];
        if (checkDay.available) {
          if (checkDay.startTime == null && checkDay.endTime == null) {
            ret = false;
          } else if (checkDay.startTime.length == 0 && checkDay.endTime.length == 0) {
            ret = false;
          }
        } else {
          nodays += 1;
        }
      }
    } else {
      ret = false;
    }
    if (nodays == 7) {
      ret = false;
    }
    return ret;
  }

  //method to get team by provided string
  private getTeamByString(getProfile: string) {
    this.team.getTeam(getProfile).subscribe((res) => {
      merge(this.returnedProfile, res);
      this.setUpTeamMemberFilter(this.returnedProfile);
      console.log('team ', this.returnedProfile);
      // this.cleanUpDivision();
    });
  }


  imageFQDN(img){
    return this.team.imageFQDN(img);
  }

  returnBoolByPath(obj, path): boolean {
    //path is a string representing a dot notation object path;
    //create an array of the string for easier manipulation
    let pathArr = path.split('.');
    //return value
    let retVal = null;
    //get the first element of the array for testing
    let ele = pathArr[0];
    //make sure the property exist on the object
    if (obj.hasOwnProperty(ele)) {
      if (typeof obj[ele] == 'boolean') {
        retVal = true;
      }
      //property exists:
      //property is an object, and the path is deeper, jump in!
      else if (typeof obj[ele] == 'object' && pathArr.length > 1) {
        //remove first element of array
        pathArr.splice(0, 1);
        //reconstruct the array back into a string, adding "." if there is more than 1 element
        if (pathArr.length > 1) {
          path = pathArr.join('.');
        } else {
          path = pathArr[0];
        }
        //recurse this function using the current place in the object, plus the rest of the path
        retVal = this.returnBoolByPath(obj[ele], path);
      } else if (typeof obj[ele] == 'object' && pathArr.length == 0) {
        retVal = obj[ele];
      } else {
        retVal = obj[ele]
      }
    }
    return !!retVal;
  }
  //this method cleans up some things to make a pretty team display and creates some filtering for the invite member search
  // TODO: DELETE IF NO LONGER NEEDED
  // private cleanUpDivision() {
  //   if (this.returnedProfile.teamDivision) {
  //     this.displayDivison += "";
  //     let divDisplay = this.returnedProfile.teamDivision.divisionName;
  //     let char = divDisplay.charAt(0);
  //     let capChar = char.toUpperCase();
  //     divDisplay = divDisplay.replace(char, capChar);
  //     this.displayDivison += divDisplay;
  //     if (this.returnedProfile.teamDivision.coastalDivision) {
  //       this.displayDivison += " " + this.returnedProfile.teamDivision.coastalDivision.toUpperCase();
  //     }
  //   }
  //   if (this.returnedProfile.teamMembers && this.returnedProfile.teamMembers.length > 0) {
  //     this.returnedProfile.teamMembers.forEach(element => {
  //       this.filterUsers.push(element.displayName);
  //     });
  //   }
  // }

}
