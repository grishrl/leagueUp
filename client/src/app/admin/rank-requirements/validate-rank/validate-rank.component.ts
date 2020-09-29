import { Component, OnInit } from '@angular/core';
import { QueuesService } from 'src/app/services/queues.service';
import { findIndex } from 'lodash';

@Component({
  selector: "app-validate-rank",
  templateUrl: "./validate-rank.component.html",
  styleUrls: ["./validate-rank.component.css"],
})
export class ValidateRankComponent implements OnInit {
  constructor(private queueService: QueuesService) {}

  queue = [];
  ngOnInit(): void {
    this.queueService.getQueues('pendingRankQueues').subscribe(
      res=>{
        this.queue = res;
        console.log(res);
      },
      err=>{
        console.warn(err);
      }
    )
  }

  handleAction(e){
        let index = findIndex(this.queue, e);
        if (index > -1) {
          this.queue.splice(index, 1);
        }
  }
}
