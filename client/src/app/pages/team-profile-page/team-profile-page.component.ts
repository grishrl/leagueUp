import { Component, OnInit, Input, OnDestroy} from '@angular/core';
import { DeleteConfrimModalComponent } from '../../modal/delete-confrim-modal/delete-confrim-modal.component'
import { ChangeCaptainModalComponent } from '../../modal/change-captain-modal/change-captain-modal.component';
import { TeamService } from '../../services/team.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { merge } from 'lodash';
import { Team } from '../../classes/team.class';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { AdminService } from '../../services/admin.service';
import { FormControl, Validators } from '@angular/forms';
import { UtilitiesService } from '../../services/utilities.service';
import { RequestService } from '../../services/request.service';
import { ConfirmRemoveMemberComponent } from '../../modal/confirm-remove-member/confirm-remove-member.component';
import { HeroesProfileService } from '../../services/heroes-profile.service';
import { DivisionService } from '../../services/division.service';
import { AssistantCaptainMgmtComponent } from 'src/app/modal/assistant-captain-mgmt/assistant-captain-mgmt.component';
import { HistoryService } from 'src/app/services/history.service';
import { TabTrackerService } from 'src/app/services/tab-tracker.service';
import { TimeService } from 'src/app/services/time.service';
import { MatDialog } from "@angular/material/dialog";


@Component({
  selector: 'app-team-profile',
  templateUrl: './team-profile-page.component.html',
  styleUrls: ['./team-profile-page.component.css']
})
export class TeamProfileComponent implements OnInit, OnDestroy {

  index=0;
  //these properties are used for inputs
  disabled: boolean = true;
  teamName: string;
  returnedProfile = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  filterUsers: any[] = []
  tempProfile
  message: string
  showDivision = false;
  season = null;
  hpLink;
  registrationOpen:boolean=false;
  routerWatch;

  errors=[];

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
  constructor(public auth: AuthService, public user: UserService, public team: TeamService, private route: ActivatedRoute, public dialog: MatDialog, private router: Router,
    private admin:AdminService, public util:UtilitiesService, private requestService:RequestService, public heroProfile: HeroesProfileService, private divisionServ: DivisionService,
    private history:HistoryService, private tabTracker:TabTrackerService, private timeService:TimeService) {

      //so that people can manually enter different tags from currently being on a profile page; we can reinitialize the component with the new info
    this.routerWatch = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.teamName = team.realTeamName(this.route.snapshot.params['id']);
        this.season = this.route.snapshot.params['season'];
        if (this.route.snapshot.queryParams["tab"]){
          this.setTab(this.route.snapshot.queryParams["tab"]);
        }
        // this.index = this.route.snapshot.queryParams['tab'];
        this.initProfile();
      }
    });
        this.timeService.getSesasonInfo().subscribe((res) => {
          this.registrationOpen = res["data"].registrationOpen;
        });

  }

  ngOnDestroy(){
    this.routerWatch.unsubscribe();
  }


  setTab(ind){
    this.tabTracker.lastRoute = 'teamProfile';
    this.tabTracker.lastTab = ind;
    this.index = ind;
  }


  //this method controls the opening of the change captain modal
  openAssCaptainChangeDialog(): void {
    const mgmtAssCpt = this.dialog.open(AssistantCaptainMgmtComponent, {
      width: '450px',
      data: { members: this.returnedProfile.teamMembers, captain: this.returnedProfile.captain, assistantCaptain: this.returnedProfile.assistantCaptain }
    });

    mgmtAssCpt.afterClosed().subscribe(result => {
      if (result != undefined && result != null) {
        this.returnedProfile.assistantCaptain = result;
        this.save();
      }
    });
  }

  //methods
  deleteUserButtonOn(player){
    return this.team.captainLevel(this.returnedProfile, player);
  }

  openConfirmRemove(player): void {
      const openConfirmRemove = this.dialog.open(ConfirmRemoveMemberComponent, {
        width: '450px',
        data: { player:player }
      });

      openConfirmRemove.afterClosed().subscribe(result => {
        if (result != undefined && result != null) {
          if(result == 'confirm'){
            // this.removeMember(player)
          }

        }
      });
    }


  adminRefreshMMR(){
    this.admin.refreshTeamMMR(this.returnedProfile.teamName_lower).subscribe(
      (res)=>{
        this.returnedProfile.teamMMRAvg = res.newMMR;
      },
      (err)=>{
        console.warn(err);
      }
    )
  }

  //init implementation
  ngOnInit() {
    this.disabled = true;
    this.returnedProfile = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

  }

  private initProfile(){


    // if(this.componentEmbedded && this.embedSource == 'admin'){
    //   this.disabled = false;
    // }

    let getProfile: string;

    if(this.season){

      this.history.getPastTeamsViaSeason([this.teamName], this.season).subscribe(
        res=>{
          merge(this.returnedProfile, res[0].object);
          this.setUpTeamMemberFilter(this.returnedProfile);
          this.checkDivision(this.returnedProfile.divisionConcat);
          this.index = this.tabTracker.returnTabIndexIfSameRoute('teamProfile');
        },
        err=>{
          console.warn(err);
        }
      )

    }else{
      if (this.providedProfile != null && this.providedProfile != undefined) {
        if (typeof this.providedProfile == 'string') {
          getProfile = this.providedProfile;
          this.getTeamByString(getProfile, 'a');
        } else {
          merge(this.returnedProfile, this.providedProfile);
          this.setUpTeamMemberFilter(this.returnedProfile);
          this.checkDivision(this.returnedProfile.divisionConcat);
          // this.cleanUpDivision();
          this.index = this.tabTracker.returnTabIndexIfSameRoute("teamProfile");
        }
      } else {
        getProfile = this.teamName;
        this.getTeamByString(getProfile, 'b');
      }
    }

    this.hpLink = this.heroProfile.getHPTeamLink(this.teamName);
  }

  checkRosterSize()
  {
    let mem = 0;
    if (this.returnedProfile.teamMembers && this.returnedProfile.teamMembers.length > 0) {
      mem += this.returnedProfile.teamMembers.length;
    }else{
      mem+=0;
    }
    if (this.returnedProfile.pendingMembers && this.returnedProfile.pendingMembers.length > 0) {
      mem += this.returnedProfile.pendingMembers.length;
    }else{
      mem+=0;
    }
    return mem < 9;
  }

  setUpTeamMemberFilter(teamProfile){
    if (teamProfile.teamMembers && teamProfile.teamMembers.length > 0) {
      teamProfile.teamMembers.forEach(element => {
        this.filterUsers.push(element['displayName']);
      });
    }
    if (teamProfile.invitedUsers && teamProfile.invitedUsers.length > 0) {
      teamProfile.invitedUsers.forEach(element => {
        this.filterUsers.push(element);
      });
    }
    if (teamProfile.pendingMembers && teamProfile.pendingMembers.length > 0) {
      teamProfile.pendingMembers.forEach(element => {
        this.filterUsers.push(element['displayName']);
      });
    }
  }

  //this boolean will keep up with wether the component is embedded in another or is acting as it's own standalone page
  // componentEmbedded: boolean = false;

  //provided profile holds anything bound to the component when it's embedded
  providedProfile: any;
  //passedProfile binding for when this component is embedded
  @Input() set passedProfile(profile) {
    if (profile != null && profile != undefined) {
      this.providedProfile = profile;
      //if we received a profile; the component is embedded:
      // this.componentEmbedded = true;
      this.disabled = false;
      this.initProfile();
    }
  }

  embedSource:string='';
  @Input() set source(_source){
    this.embedSource = _source;
  }

  validAvailableTimes:boolean
  validAvailDays:number=0;
  receiveValidTimes(event){
    this.validAvailableTimes=event.valid;
    this.validAvailDays = event.numdays
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
              this.returnedProfile = res;
              this.disabled = true;
              this.auth.destroyCaptain();
            },
            (err)=>{
              console.warn(err)
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
          console.warn(err);
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
            this.router.navigate(['/_admin/manageTeam']);

          }, err => {
            console.warn(err);
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
            console.warn(err);
          }
        )
      }
    });
  }



  //this method enables form inputs for changes
  openEdit(){
    this.disabled=false;
    this.tempProfile = Object.assign({}, this.returnedProfile);
  }

  //this method resets the profile back to pre-edit state and disables inputs for changes
  cancel() {
    this.returnedProfile = Object.assign({}, this.tempProfile);
    this.disabled = true;
  }

  //this method checks that the inputs are valid and if so, saves the team object
  save() {
    if (this.validate()) {
      this.disabled = true;

      this.util.updateAvailabilityToNum(this.returnedProfile);
      // let keys = Object.keys(this.returnedProfile.availability);
      // keys.forEach(element => {
      //   let obj = this.returnedProfile.availability[element];
      //   if (obj.available) {
      //     obj['startTimeNumber'] = this.util.convertToMil(obj.startTime);
      //     obj['endTimeNumber'] = this.util.convertToMil(obj.endTime);
      //   }
      // });

      if (!this.checkRosterSize()){
        this.returnedProfile.lookingForMore = false;
      }

      let cptRemoved = Object.assign({}, this.returnedProfile);
      delete cptRemoved.captain;

      this.team.saveTeam(cptRemoved).subscribe((res) => {
        this.disabled = true;
      }, (err) => {
        console.warn(err);
        alert(err.message);
      });
    } else {
      //activate validator errors
      alert('the data was invalid');
      console.warn('the data was invalid')
    }

  }

  //method for inviting users to join this team
  invite(user) {
    if (this.returnedProfile.teamName && user) {
      if (this.checkUserInPending(user)) {
        this.message = "User is all ready invited to your team!";
      }else{
        this.requestService.inviteToTeamRequest(this.returnedProfile.teamName_lower, user).subscribe(
          res=>{
            if (this.returnedProfile['invitedUsers'] == null) {
              this.returnedProfile['invitedUsers'] = [ user ];
            } else {
              this.returnedProfile['invitedUsers'].push(user);
            }
          },
          err=>{
            this.message = err.error.message;
        }
        );
      }

    }
  }

  checkUserInPending(user){
    let returnValue = false;
    if (this.returnedProfile.pendingMembers){
      this.returnedProfile.pendingMembers.forEach(pendingMember => {
        if (pendingMember.displayName == user) {
          returnValue = true;
        }
      });
    }else if(this.returnedProfile['invitedUsers']){
      this.returnedProfile['invitedUsers'].forEach(invited=>{
        if(invited == user){
          returnValue = true;
        }
      });
    }
    return returnValue;
  }

  //method takes in the factors at hand to show the captain edit options or the admin edit options
  showEditDialog(){
    if(this.embedSource == 'admin'){
      return false;
    }else if(this.season){
      return false;
    }else{
      let isteamcpt;
      if (this.auth.getCaptain()) {
        isteamcpt = this.team.captainLevel(this.returnedProfile, this.auth.getUser());
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

  //method determines whether a division is marked public so as to show the division info in team profile or not, prevents peeking division placement preseason
  checkDivision(div){
    if(this.embedSource == 'admin'){
      this.showDivision = true;
    }else if(this.season){
      this.showDivision = true;
    }else{
      if (!this.util.isNullOrEmpty(div)) {
        this.divisionServ.getDivision(div).subscribe(
          res => {
            if(res.public){
              this.showDivision=true;
            }
          },
          err => {
            console.warn(err)
          }
        )
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

  timezoneError;

  //method to validate the inputs we require.
  validate() {
    this.errors = [];
    let valid = true;

    //ensure time zone
    if (this.validAvailDays>0 && this.isNullOrEmpty(this.returnedProfile.timeZone)) {
      valid = false;
      this.timezoneError = {
        error:true
      }
      this.errors.push("Timezone required with time's available.");
    }else{
      this.timezoneError = {error:false};
    }
    return valid;
  }

  //method to get team by provided string
  private getTeamByString(getProfile: string, caller) {
    this.team.getTeam(getProfile).subscribe((res) => {
      merge(this.returnedProfile, res);
      this.setUpTeamMemberFilter(this.returnedProfile);
      this.checkDivision(this.returnedProfile.divisionConcat);
      this.index = this.tabTracker.returnTabIndexIfSameRoute("teamProfile");
    });
  }

  //method to determine if user is a member of a team but not captain
  //shows button to leave team if so, and is not admin embedded
  showLeaveTeam(playerName){
    // if(this.componentEmbedded){
    //   return false;
    // }else{
      if ( this.returnedProfile.captain != this.auth.getUser() && playerName == this.auth.getUser()) {
        return true;
      } else {
        return false;
      }
    // }
  }

  timeValid;
  recieveAvailTimeValidity($event){
    if(this.timeValid != $event.valid){
      this.timeValid = $event.valid
    }
  }

}
