import { Component, OnInit } from '@angular/core';
import { QueuesService } from '../../services/queues.service';
import { findIndex } from 'lodash';

@Component({
  selector: 'app-approve-member',
  templateUrl: './approve-member.component.html',
  styleUrls: ['./approve-member.component.css']
})



export class ApproveMemberComponent implements OnInit {

  //component properties
  queue 

  constructor(private queueService:QueuesService) {
   }
  
  ngOnInit() {
    this.queueService.getQueues('pendingMemberQueue').subscribe( res=>{
      this.queue = res;
    } );
  }

  //removes an item from the view if it has been actioned
  updateView(item){
    let index = findIndex(this.queue, item);
    if(index>-1){
      this.queue.splice(index,1);
    }
  }

}
