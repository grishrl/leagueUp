import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { StandingsService } from 'src/app/services/standings.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-tournament-generator',
  templateUrl: './tournament-generator.component.html',
  styleUrls: ['./tournament-generator.component.css']
})
export class TournamentGeneratorComponent implements OnInit {

  divisions: any = [];
  selectedDivision: any = null;
  constructor(private adminService:AdminService, private standingsService:StandingsService) { }

  selected(div) {
    console.log(div);
    this.getStandings(div.divisionConcat);
  }

  standings:any=[];

  getStandings(div) {
    this.standingsService.getStandings(div).subscribe(
      (res) => {
        this.standings = res;
      },
      (err) => {
        console.log(err);
      }
    )
  }

  generateBrackets(){
    console.log(this.tournamentSeed);
  }

  ngOnInit() {
    this.adminService.getDivisionList().subscribe((res) => {
      this.divisions = res;
    }, (err) => {
      console.log(err);
    })
  }


  tournamentSeed = [

  ];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

}
