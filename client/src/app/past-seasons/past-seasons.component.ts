import { Component, OnInit } from '@angular/core';
import { HistoryService } from '../services/history.service';
import { TimeserviceService } from '../services/timeservice.service';
import { FilterService } from '../services/filter.service';

@Component({
  selector: 'app-past-seasons',
  templateUrl: './past-seasons.component.html',
  styleUrls: ['./past-seasons.component.css']
})
export class PastSeasonsComponent implements OnInit {

  constructor(private HS: HistoryService, private timeService: TimeserviceService, private FS:FilterService) { }

  seasonsList = [];
  selectedSeason;

  divisionList = [];
  selectedDivision;

  ngOnInit() {
    this.timeService.getSesasonInfo().subscribe(
      res => {
        let currentSeason = res.value;
        this.HS.getPastSeasons().subscribe(
          res => {
            res.forEach(element => {
              if (parseInt(element.season) != parseInt(currentSeason)){
                this.seasonsList.push(element.season);
              }
            });
          },
          err => {
            console.warn(err);
          }
        )
      }
    );

  }

  seasonSelected(){
    this.HS.getSeasonDivisions(this.selectedSeason).subscribe(
      res=>{
        this.divisionList = [];
        res.forEach(element=>{
          this.divisionList.push(element.object);
          this.divisionList.sort((a, b) => { return this.FS.arrangeDivisions(a,b)});
        });
      },
      err=>{
        console.warn(err);
      }
    )
  }

  divisionSelected(){

  }

}
