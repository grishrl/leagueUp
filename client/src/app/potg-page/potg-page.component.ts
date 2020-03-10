import { Component, OnInit } from '@angular/core';
import { MvpService } from '../services/mvp.service';
import { TimeserviceService } from '../services/timeservice.service';

@Component({
  selector: 'app-potg-page',
  templateUrl: './potg-page.component.html',
  styleUrls: ['./potg-page.component.css']
})
export class PotgPageComponent implements OnInit {

  constructor(private mvpServ:MvpService, private timeService:TimeserviceService) { }

  mvpList;
  ngOnInit(): void {

        this.timeService.getSesasonInfo().subscribe(res => {
          console.log(res["value"]);
          this.mvpServ.getMvpById('season', res["value"]).subscribe(
            mvps=>{
              this.mvpList = mvps;
            }
          )
        });


  }

}
