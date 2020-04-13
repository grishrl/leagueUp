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
              console.log(mvps);
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
  // sort(sortBy){
  //   console.log('lastChoice', this.lastChoice)
  //   console.log("sortBy", sortBy);
  //   if(this.lastChoice == sortBy){
  //     this.invert = -1*this.invert;
  //   }else{
  //     this.invert = 1;
  //   }
  //   console.log("invert", this.invert);
  //   this.lastChoice = sortBy;
  //   this.mvpList = this.mvpList.sort(
  //     (a,b)=>{
  //       let retVal = 0;
  //       if(a[sortBy] && b[sortBy]){
  //        retVal = this.invert*(a[sortBy] - b[sortBy]);
  //       }
  //       return retVal;
  //     }
  //   );
  //   // if(this.invert<0){
  //   //   this.mvpList = this.mvpList.reverse();
  //   // }
  // }

  sort(prop){
              if (this.lastChoice == prop) {
                this.invert = -1 * this.invert;
              } else {
                this.invert = 1;
              }
              this.lastChoice = prop;

              this.mvpList = this.mvpList.sort((a, b) => {
                let retVal = 0;
                if (a[prop] && b[prop]) {
                  retVal = a[prop] - b[prop];
                }
                return retVal;
              });
              if (this.invert < 0) {
                this.mvpList = this.mvpList.reverse();
              }
            }

}
