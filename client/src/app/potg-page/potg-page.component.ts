import { Component, OnInit } from '@angular/core';
import { MvpService } from '../services/mvp.service';
import { TimeserviceService } from '../services/timeservice.service';
import { last } from 'rxjs/operators';

@Component({
  selector: 'app-potg-page',
  templateUrl: './potg-page.component.html',
  styleUrls: ['./potg-page.component.css']
})
export class PotgPageComponent implements OnInit {

  constructor(private mvpServ:MvpService, private timeService:TimeserviceService) { }

  mvpList = [];
  ngOnInit(): void {

        this.timeService.getSesasonInfo().subscribe(res => {
          this.mvpServ.getMvpById('season', res["value"]).subscribe(
            mvps=>{
              mvps.forEach(m=>{
                if(m.potg_link && m.potg_link.length>0){
                   this.mvpList.push(m);
                }
              })
            }
          )
        });


  }

  invert = 1;
  lastChoice;
  sort(sortBy){
    if(this.lastChoice == sortBy){
      this.invert = -1*this.invert;
    }else{
      this.invert = 1;
    }
    this.mvpList = this.mvpList.sort(
      (a,b)=>{
        if(a[sortBy]>b[sortBy]){
          return 1*this.invert;
        }else{
          return -1*this.invert;
        }
      }
    )
  }

}
