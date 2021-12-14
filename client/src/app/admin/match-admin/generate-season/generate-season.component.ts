import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-generate-season',
  templateUrl: './generate-season.component.html',
  styleUrls: ['./generate-season.component.css']
})
export class GenerateSeasonComponent implements OnInit {

  seasonNumber:number
  validated:boolean=true;
  seasonFull:boolean = false;
  constructor(private admin:AdminService) { }


  validateSeason(num){
    if(num){
      this.validated = false;
      this.seasonFull = false;
      this.admin.validateSeason(num).subscribe(
        res => {
          this.validated = res['valid'];
          if (!this.validated) {
            this.seasonFull = true;
          }
        },
        err => {
          console.warn(err);
        }
      )
    }

  }

  disabled(){
    if(this.seasonNumber){
      return !this.validated;
    }else{
      return true;
    }
  }

  generateSeason(){
    if(this.seasonNumber && this.validated){
      let first = confirm("Are you sure?");
      if(first){
        let second = confirm("Have you made sure that all the division are set up how you want and all teams are properly placed?");
        if(second){
          let third = confirm("It would be awefully dreadful if you had made a mistake; I sure hope you know what you're doing.");
          if(third){
            this.admin.generateSeason(this.seasonNumber).subscribe(
              res=>{
                alert("Schedules for season "+this.seasonNumber+" were generated!");
                this.validated = false;
              },
              err=>{
                alert("Something went wrong generating the schedules!");
              }
            )
          }
        }
      }
    }
    console.log('you\'ve really done it now');
  }

  ngOnInit() {
  }

}
