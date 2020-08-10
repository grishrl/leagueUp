import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../../services/schedule.service';

@Component({
  selector: "app-active-tournament-viewer",
  templateUrl: "./active-tournament-viewer.component.html",
  styleUrls: ["./active-tournament-viewer.component.css"],
})
export class ActiveTournamentViewerComponent implements OnInit {
  constructor(private scheduleServ: ScheduleService) {}

  index = 0;

  currentTournaments = [];
  selectedTournament = {
    challonge_url:undefined,
    teamMatches:[]
  };

  ngOnInit(): void {
    this.scheduleServ.getActiveTournaments().subscribe((res) => {
      this.currentTournaments = res;
    });
  }
}
