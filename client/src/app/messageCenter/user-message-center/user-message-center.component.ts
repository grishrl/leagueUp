import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { MessagesService } from 'src/app/services/messages.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { RequestService } from 'src/app/services/request.service';

@Component({
  selector: 'app-user-message-center',
  templateUrl: './user-message-center.component.html',
  styleUrls: ['./user-message-center.component.css']
})
export class UserMessageCenterComponent implements OnInit {

  constructor(public user:UserService, private request:RequestService, private auth:AuthService, private messageCenter:MessagesService, private notificationService:NotificationService) { }

  messages:any = [];
  selectedMessage;

  selectMessage(message){
    this.selectedMessage = message;
    this.messageCenter.markRead(message._id).subscribe(
      res=>{
        this.notificationService.updateMessages.next('Msg center updated');
        console.log('back from the message center ', res);
      },err=>{
        console.log(err);
      }
    )
  }

  deleteMessage(message){
    this.messageCenter.deleteMessage(message._id).subscribe(res=>{
      let ind = -1;
      this.messages.forEach((element, index) => {
        if(element._id==message._id){
          ind = index;
        }
      });
      if(ind>-1){
        this.messages.splice(ind, 1);
        if (this.selectedMessage._id == message._id){
          this.selectMessage = null;
        }
      }
    },err=>{
      console.log(err);
    })
  }

  actionRequest(act, msg){
    if(act){
      this.request.approveTeamRequest(msg.request.target, msg.request.requester).subscribe( (res)=>{
        console.log('res ',res);
      }, (err)=>{ 
        console.log('err ',err);
      })
    }else{

    }

  }

  ngOnInit() {
    this.messageCenter.getMessages(this.auth.getUserId()).subscribe(
      res=>{
        this.messages = res;
        // console.log(res);
      },
      err=>{
        console.log(err);
      }
    )
  }

}
