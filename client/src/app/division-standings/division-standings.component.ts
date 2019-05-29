import { Component, OnInit } from '@angular/core';
import { StandingsService } from '../services/standings.service';
import { TeamService } from '../services/team.service';
import { AuthService } from '../services/auth.service';
import { DivisionService } from '../services/division.service';

@Component({
  selector: 'app-division-standings',
  templateUrl: './division-standings.component.html',
  styleUrls: ['./division-standings.component.css']
})
export class DivisionStandingsComponent implements OnInit {

  constructor(private standingsService: StandingsService, public team: TeamService, private auth: AuthService, private DivisionService: DivisionService) { }

  standings = [];
  passDiv ;
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

  selectedDiv(div){
    if(div){
      this.getStandings(div.divisionConcat);
    }
  }

  // selectedDiv;

  ngOnInit() {
    console.log('this.auth.getTeam() ', this.auth.getTeam());
    if (this.auth.getTeam()){
      this.team.getTeam(this.auth.getTeam()).subscribe(
        res => {
          this.getStandings(res.divisionConcat)
        },
        err => {
          console.log(err);
        }
      )
    }else{
      this.DivisionService.getDivisionInfo().subscribe((res) => {
        let divisions = res;
        let randomDivInt = Math.floor(Math.random() * divisions.length);
        let randomDivision = divisions[randomDivInt];
        this.getStandings(randomDivision.divisionConcat);
        this.passDiv = randomDivision;
      }, (err) => {
        console.log(err);
      })
    }

  }

}
