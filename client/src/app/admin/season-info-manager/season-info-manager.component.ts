import { Component, OnInit } from '@angular/core';
import { TimeserviceService } from 'src/app/services/timeservice.service';

@Component({
  selector: 'app-season-info-manager',
  templateUrl: './season-info-manager.component.html',
  styleUrls: ['./season-info-manager.component.css']
})
export class SeasonInfoManagerComponent implements OnInit {

  constructor(private timeservice:TimeserviceService) {

   }

   editSeason


   showWarning=false;
  selectedSeason
  getSpecificSeason(){

    this.timeservice.getSpecificSeason(this.selectedSeason).subscribe(
      res=>{
          if(res){
            this.showWarning = false;
            this.editSeason = res;
        }else{
          alert("If you create an entry greater than the current season; it will override the current season!")
          this.editSeason = {
            value:this.selectedSeason,
            data:{
              'seasonStartDate':null,
              'seasonEndDate':null,
              'registrationOpen':false,
              'registrationEndDate':null
            }
          }
          this.showWarning = true;
        }

      }
    );

  }
  seasons = [];
  ngOnInit() {
    for(var i=7; i<200; i++){
      this.seasons.push(i);
    }
  }

  save(){

    if(this.editSeason.data.registrationOpen === null){
      this.editSeason.data.registrationOpen = false;
    }
    if(this.showWarning){
      let pass =confirm('You might be over-riding the current active season! \n Are you sure?');
      if(pass){
        this.timeservice.postInfo(this.editSeason).subscribe(
          res => {
            console.log(res);
          },
          err => {
            console.log(err);
          }
        )
      }else{
        this.editSeason = {};
      }
    }else{
      this.timeservice.postInfo(this.editSeason).subscribe(
        res => {
          console.log(res);
        },
        err => {
          console.log(err);
        }
      )
    }

  }

}
