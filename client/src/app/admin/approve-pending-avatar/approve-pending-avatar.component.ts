import { Component, OnInit } from '@angular/core';
import { QueuesService } from '../../services/queues.service';
import { findIndex } from 'lodash';

@Component({
  selector: 'app-approve-pending-avatar',
  templateUrl: './approve-pending-avatar.component.html',
  styleUrls: ['./approve-pending-avatar.component.css']
})
export class ApprovePendingAvatarComponent implements OnInit {

  //component properties
  queue

  constructor(private queueService: QueuesService) {
  }

  ngOnInit() {
    this.queueService.getQueues('pendingAvatarQueue').subscribe(res => {
      this.queue = res;
    });
  }

  //removes an item from the view if it has been actioned
  updateView(item) {
    let index = findIndex(this.queue, item);
    if (index > -1) {
      this.queue.splice(index, 1);
    }
  }

}
