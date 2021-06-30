import { Component, OnInit } from '@angular/core';
import { TimeserviceService } from 'src/app/services/timeservice.service';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-archive-season',
  templateUrl: './archive-season.component.html',
  styleUrls: ['./archive-season.component.css']
})
export class ArchiveSeasonComponent implements OnInit {

  currentSeason:number;

  constructor(private timeService:TimeserviceService, private admin:AdminService) {
        this.timeService.getSesasonInfo().subscribe((res) => {
          this.currentSeason = res['value'];
        });
   }

  ngOnInit(): void {
  }

  archiveSeason(){
    if (
      confirm(
        "Are you absolutely sure that the season is complete and ready to be archived/reset?"
      )
    ){
      this.admin.archiveSeason().subscribe((res) => {
          console.warn(res);
        });

    }

  }

}
