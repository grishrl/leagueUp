import { Component, OnInit } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';

@Component({
  selector: 'app-delete-tournament',
  templateUrl: './delete-tournament.component.html',
  styleUrls: ['./delete-tournament.component.css']
})
export class DeleteTournamentComponent implements OnInit {

  constructor(private scheduleServ: ScheduleService) { }

  tournaments = [];

  ngOnInit(): void {
    this.tournaments = [];
    this.scheduleServ.getActiveTournaments().subscribe(res=>{
      res.forEach(
        tourn=>{
          let progressReported = false;
          let matchesScheduled = false;
          tourn.teamMatches.forEach((match) => {
            if (match.hasOwnProperty("reported") && match.reported) {
              progressReported = true;
            }
            if (match.hasOwnProperty("scheduledTime")) {
              matchesScheduled = true;
            }
          });
          if(!progressReported){
            tourn.matchesScheduled = matchesScheduled;
            this.tournaments.push(tourn);
          }
        },
        err=>{
          console.warn(err);
        }
      )
    });
  }

  delete(tourn){
    if (tourn.matchesScheduled){
      alert('Some of these matches have been scheduled all ready!');
    }
    this.scheduleServ.deleteTournament(tourn.challonge_ref).subscribe(
      res=>{
        this.ngOnInit();
      },
      err=>{
        console.warn(err);
      }
    );
  }

}
