import { Component, OnInit, Input} from '@angular/core';
import { MatDialog } from '@angular/material';
import { DeleteConfrimModalComponent } from '../modal/delete-confrim-modal/delete-confrim-modal.component'
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
import { Profile } from '../classes/profile.class';


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
  displayMembersLeft: any[] = [];
  displayMembersRight: any[] = [];

  hlMedals = ['Grand Master', 'Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'];
  hlDivision = [1, 2, 3, 4, 5];
  competitonLevel = [
    { val: 1, display: 'Low' },
    { val: 3, display: 'Medium' },
    { val: 5, display: 'High' }
  ]

  //form controls
  timezoneControl = new FormControl({ value: '', disabled: true }, [
    Validators.required
  ]);

  emailControl = new FormControl({ value: '' }, [
    Validators.email,
    Validators.required
  ]);

  emailAddress: string;
  inviteEmail() {
    let storedEmail = this.emailAddress;
    this.emailAddress = '';
    if (storedEmail.length > 0) {
      this.user.emailOutreach(storedEmail).subscribe(
        (res) => {
          this.message = res['message'];
        },
        (err) => {

        }
      )
    }
  }

  //constructor
  constructor(private auth: AuthService, private user: UserService, public timezone: TimezoneService, private team: TeamService, private route: ActivatedRoute, public dialog: MatDialog, private router: Router,
    private admin:AdminService) {
    this.teamName = team.realTeamName(this.route.snapshot.params['id']);
  }

  //methods

  deleteUserButtonOn(player){
    return player==this.returnedProfile.captain;
  }

  removeMember(player){
    if(this.componentEmbedded){
      this.admin.removeMembers(this.returnedProfile.teamName_lower, player).subscribe(
        (res) => {
          // console.log('user removed');
          this.ngOnInit();
        },
        (err) => {
          console.log(err);
        }
      )
    }else{
      this.team.removeUser(player, this.returnedProfile.teamName_lower).subscribe(
        (res) => {
          console.log('user removed');
          this.ngOnInit();
        },
        (err) => {
          console.log(err);
        }
      )
    }

  }

  adminRefreshMMR(){
    this.admin.refreshTeamMMR(this.returnedProfile.teamName_lower).subscribe(
      (res)=>{
        this.returnedProfile.teamMMRAvg = res.newMMR;
      },
      (err)=>{
        console.log(err);
      }
    )
  }


  formControlledEnable() {
    this.timezoneControl.enable();
  }

  formControlledDisable() {
    this.timezoneControl.disable();
  }

  //init implementation
  ngOnInit() {
    this.displayMembersLeft = [];
    this.displayMembersRight = [];
    this.returnedProfile = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
    let getProfile: string;
    // console.log('typeof this.providedProfile: ', typeof this.providedProfile);
    // console.log('his.providedProfile: ', this.providedProfile);
    if (this.providedProfile != null && this.providedProfile != undefined) {
      if (typeof this.providedProfile == 'string') {
        getProfile = this.providedProfile;
        this.orignalName = this.team.realTeamName(this.providedProfile);
        this.getTeamByString(getProfile);
        
      } else {
        merge(this.returnedProfile, this.providedProfile);
        this.setUpTeamMemberFilter(this.returnedProfile);
        this.stratifyTeamMembers()
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
    // console.log('teamProfile ',teamProfile);
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
    // console.log('model change');
    // console.log('this.returnedProfile.teamName ', this.returnedProfile.teamName);
    // console.log('this.returnedProfile.teamName_lower ', this.returnedProfile.teamName_lower);
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

  validAvailableTimes:boolean
  receiveValidTimes(event){
    this.validAvailableTimes=event;
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
    const dialogRef = this.dialog.open(DeleteConfrimModalComponent, {
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

    const dialogRef = this.dialog.open(DeleteConfrimModalComponent, {
      width: '300px',
      data: { confirm: this.confirm }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.toLowerCase() == 'delete') {
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
        // console.log('team was saved!');
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
    // console.log(user);
    if (this.returnedProfile.teamName && user) {
      this.team.addUser(user, this.returnedProfile.teamName_lower).subscribe(res => {
        this.message = res.message;
        this.filterUsers.push(user);
        // console.log(this.filterUsers);
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
    if (!this.validAvailableTimes){
      valid = false;
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

  stratifyTeamMembers(){
    this.displayMembersLeft = [];
    this.displayMembersRight = [];
    if(this.returnedProfile.teamMembers.length>3){
      let half = Math.round(this.returnedProfile.teamMembers.length / 2);
      for(var i = 0; i < half; i++){
        this.displayMembersLeft.push(this.returnedProfile.teamMembers[i]);
      }

      for (var j = half; j < this.returnedProfile.teamMembers.length; j++){
        this.displayMembersRight.push(this.returnedProfile.teamMembers[j]);
      }
    }else{
      this.displayMembersLeft = this.returnedProfile.teamMembers;
      this.displayMembersRight = [];
    }
  }

  //method to get team by provided string
  private getTeamByString(getProfile: string) {
    this.team.getTeam(getProfile).subscribe((res) => {
      merge(this.returnedProfile, res);
      this.setUpTeamMemberFilter(this.returnedProfile);
      this.stratifyTeamMembers()
      // console.log('team ', this.returnedProfile);
      // this.cleanUpDivision();
    });
  }


  imageFQDN(img){
    return this.team.imageFQDN(img);
  }

}
