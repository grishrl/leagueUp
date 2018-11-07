import { Component, OnInit } from '@angular/core';
import { QueuesService } from '../../services/queues.service';
import { findIndex } from 'lodash';

@Component({
  selector: 'app-approve-member',
  templateUrl: './approve-member.component.html',
  styleUrls: ['./approve-member.component.css']
})



export class ApproveMemberComponent implements OnInit {


  constructor(private queueService:QueuesService) {
   }

  queue 
  ngOnInit() {
    this.queueService.getQueues('pendingMemberQueue').subscribe( res=>{
      this.queue = res;
    } );
  }

  updateView(item){
    let index = findIndex(this.queue, item);
    if(index>-1){
      this.queue.splice(index,1);
    }
  }

}
