import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, NavigationStart } from '@angular/router';
import { TeamService } from '../services/team.service';
import { UserService } from '../services/user.service';
import { DivisionService } from '../services/division.service';
import { MessagesService } from '../services/messages.service';
import { NotificationService } from '../services/notification.service';
// import { Socket } from 'ngx-socket-io';
// import { WebsocketService } from '../services/websocket.service';
import { TimeserviceService } from '../services/timeservice.service';

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
    private notificationService:NotificationService, private timeService:TimeserviceService) {
      if(this.Auth.isAuthenticated()){
        this.user.heartbeat().subscribe(res=>{

        },err=>{

        });
      }

      this.timeService.getSesasonInfo();

      this.notificationService.updateLogin.subscribe(
        res => {
          this.ngOnInit();
          this.menuAPI.initPanels([document.querySelector('#mobile-nav-list')]);
        }
      )
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
  ngAfterViewInit(){
    this.createMobileNav();
    $('ul.sf-menu').superfish();
    $('.mainmenu').sticky({ topSpacing: 0 });
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
      console.log(err);
    });

    //get any user messages
    this.messages.getMessageNumbers(this.Auth.getUserId()).subscribe( (res)=>{
      if(res){
        if(res){
          this.userMessages = parseInt(res);
        }

      }
    }, err=>{
      console.log(err);
    })

    //set up socket connection for the logged in user
    if(this.Auth.getUserId()){
      // this.socket.emit('storeClientInfo', { userId: this.Auth.getUserId() });
    }
    //subscribe to the socket emiter if a user gets a message to update their information
    // this.socket.fromEvent('newMessage').subscribe(
    //   res=>{
    //     this.userMessages+=1;
    //   },
    //   err=>{
    //     console.log(err);
    //   }
    // )
    //updates the unread messages bubble...
    this.notificationService.updateMessages.subscribe(
      message=>{
        this.messages.getMessageNumbers(this.Auth.getUserId()).subscribe((res) => {
          if(res){
            this.userMessages = res;
          }else{
            this.userMessages = 0;
          }

        }, err => {
          console.log(err);
        });
      }
    )

  }
}
