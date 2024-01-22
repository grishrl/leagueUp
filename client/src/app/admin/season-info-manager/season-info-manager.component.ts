import { Component, OnInit } from '@angular/core';
import { TimeService } from 'src/app/services/time.service';

@Component({
  selector: 'app-season-info-manager',
  templateUrl: './season-info-manager.component.html',
  styleUrls: ['./season-info-manager.component.css']
})
export class SeasonInfoManagerComponent implements OnInit {

  constructor(private timeservice:TimeService) {

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
            // data:{
              'value':this.selectedSeason,
              'seasonStartDate':null,
              'seasonEndDate':null,
              'registrationOpen':false,
              'registrationEndDate':null
            // }
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

    if(this.editSeason.registrationOpen === null){
      this.editSeason.registrationOpen = false;
    }
    if(this.showWarning){
      let pass =confirm('You might be over-riding the current active season! \n Are you sure?');
      if(pass){
        this.timeservice.postInfo(this.editSeason).subscribe(
          res => {

          },
          err => {
            console.warn(err);
          }
        )
      }else{
        this.editSeason = {};
      }
    }else{
      this.timeservice.postInfo(this.editSeason).subscribe(
        res => {

        },
        err => {
          console.warn(err);
        }
      )
    }

  }

}
