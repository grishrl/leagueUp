import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { MessagesService } from 'src/app/services/messages.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { RequestService } from 'src/app/services/request.service';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-user-message-center',
  templateUrl: './user-message-center.component.html',
  styleUrls: ['./user-message-center.component.css']
})
export class UserMessageCenterComponent implements OnInit {

  constructor(public util:UtilitiesService, public user:UserService, public team:TeamService, private request:RequestService, private auth:AuthService, private messageCenter:MessagesService,
    private notificationService:NotificationService, private socket:Socket) {
    this.socket.fromEvent('newMessage').subscribe(
      res => {
        this.ngOnInit();
      },
      err => {
        console.log(err);
      }
    )
   }

  messages:any = [];
  selectedMessage;

  isSelected(message){
    if(this.selectedMessage && message){
      return this.selectedMessage._id == message._id
    }else{
      return false;
    }

  }

  selectMessage(message){
    this.selectedMessage = message;
    this.messageCenter.markRead(message._id).subscribe(
      res=>{
        this.notificationService.updateMessages.next('Msg center updated');
      },err=>{
        console.log(err);
      }
    )
  }

  deleteMessage(message){
    console.log('xxx ', message);
    if (this.util.returnBoolByPath(message,'request')){
      this.actionRequest(false, message);
    }else{
      console.log('a');
      this.messageCenter.deleteMessage(message._id).subscribe(res => {
        let ind = -1;
        this.messages.forEach((element, index) => {
          if (element._id == message._id) {
            ind = index;
          }
        });
        console.log(ind);
        if (ind > -1) {
          this.messages.splice(ind, 1);
          if (this.selectedMessage._id == message._id) {
            this.selectedMessage = null;
          }
        }
      }, err => {
        console.log(err);
      })
    }

  }

  actionRequest(act, msg){
    if (msg.request.instance == 'team'){
      this.request.approveTeamRequest(msg.request.target, msg.request.requester, act, msg._id).subscribe((res) => {
        this.ngOnInit();
      }, (err) => {
        this.ngOnInit();
      })
    } else if (msg.request.instance == 'user'){
      this.request.acceptTeamInvite(msg.request.requester, msg.request.target, act, msg._id).subscribe((res) => {
        this.ngOnInit();
      }, (err) => {
        this.ngOnInit();
      });
    } else if (msg.request.hasOwnProperty('players') || msg.request.hasOwnProperty('teams')){

      this.messageCenter.deleteMessage(msg._id).subscribe(res => {
        let ind = -1;
        this.messages.forEach((element, index) => {
          if (element._id == msg._id) {
            ind = index;
          }
        });
        console.log(ind);
        if (ind > -1) {
          this.messages.splice(ind, 1);
          if (this.selectedMessage && this.selectedMessage._id == msg._id) {
            this.selectedMessage = null;
          }
        }
      }, err => {
        console.log(err);
      })


    }

  }

  ngOnInit() {
    this.messages = [];
    this.selectedMessage = null;
    this.messageCenter.getMessages(this.auth.getUserId()).subscribe(
      res=>{
        this.messages = res;
      },
      err=>{
        console.log(err);
      }
    )
  }

}
