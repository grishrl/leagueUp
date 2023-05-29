import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, NavigationStart } from '@angular/router';
import { TeamService } from '../services/team.service';
import { UserService } from '../services/user.service';
import { DivisionService } from '../services/division.service';
import { MessagesService } from '../services/messages.service';
import { NotificationService } from '../services/notification.service';
import { TimeService } from 'src/app/services/time.service';
import { environment } from '../../environments/environment'

declare var Mmenu: any;

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  divisions
  userMessages:number=0;

  constructor(public Auth:AuthService, private router: Router, public team:TeamService,
    public user:UserService, private divisionService: DivisionService, private messages:MessagesService,
    private notificationService:NotificationService, private timeService:TimeService) {

      this.notificationService.updateLogin.subscribe(
        res => {
          this.ngOnInit();
          this.menuAPI.initPanels([document.querySelector('#mobile-nav-list')]);
        }
      )
      this.timeService.getSesasonInfo().subscribe((res) => {
        this.currentSeason = res.value;
      });
   }

  logout(){
    this.Auth.destroyAuth('/logout');
    this.menuAPI.closeAllPanels();
    this.menuAPI.initPanels([document.querySelector('#mobile-nav-list')]);
  }

  @ViewChild('mobileNav', { static: false }) mobileMavElement;
  @ViewChild('menuList', { static: false }) menuList;

  menuVar;
  menuAPI;
  currentSeason;
  statsBucket = environment.s3bucketStats;
  statsRegion = environment.s3regionStats;

  ngAfterViewInit(){
    $("ul.sf-menu").superfish();
    $(".mainmenu").sticky({ topSpacing: 0 });
    this.createMobileNav();
}

createMobileNav(){
  this.menuVar = new Mmenu(this.mobileMavElement.nativeElement, {}, {});
  this.menuAPI = this.menuVar.API;
}


  ngOnInit() {

    this.router.events.subscribe(
      event=>{
        if(event instanceof NavigationStart){
          if (this.menuAPI) {
            this.menuAPI.close();
          }
        }
      }
    )

    //get divisions for the division list drop down
    this.divisionService.getDivisionInfo().subscribe( res => {
      this.divisions = res;
    }, err=>{
      console.warn(err);
    });

    //get any user messages
    if(this.Auth.getUserId()){
      this.messages.getMessageNumbersInterval(this.Auth.getUserId());
    }


    //updates the unread messages bubble...
    this.notificationService.updateMessages.subscribe(
      message=>{
        this.userMessages = parseInt(message);
        }
    )

  }
}
