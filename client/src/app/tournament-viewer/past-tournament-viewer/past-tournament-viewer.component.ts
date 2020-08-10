import { Component, OnInit } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';

@Component({
  selector: "app-past-tournament-viewer",
  templateUrl: "./past-tournament-viewer.component.html",
  styleUrls: ["./past-tournament-viewer.component.css"],
})
export class PastTournamentViewerComponent implements OnInit {
  constructor(private scheduleServ: ScheduleService) {}

  currentTournaments = [];
  selectedTournament = {
    challonge_url: undefined,
    teamMatches: [],
  };

  ngOnInit(): void {
    this.scheduleServ.getPastNonSeasonalTournaments().subscribe((res) => {
      this.currentTournaments = res;
    });
  }
}
