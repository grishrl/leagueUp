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
  noDivisions=false;
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

    if (this.auth.getTeam()){
      this.team.getTeam(this.auth.getTeam()).subscribe(
        res => {
          if (res.divisionConcat){
            this.DivisionService.getDivision(res.divisionConcat).subscribe(
              res=>{
                if(res.public){
                  this.passDiv = res;
                  this.getStandings(res.divisionConcat);
                }else{
                  this.randomDivision();
                }
              }
            );
          }else{
            this.randomDivision();
          }
        },
        err => {
          console.log(err);
        }
      )
    }else{
      this.randomDivision();
    }

  }


  private randomDivision() {
    this.DivisionService.getDivisionInfo().subscribe((res) => {
      if(res.length>0){
        let divisions = res;
        let randomDivInt = Math.floor(Math.random() * divisions.length);
        let randomDivision = divisions[randomDivInt];
        this.getStandings(randomDivision.divisionConcat);
        this.passDiv = randomDivision;
      }else{
        this.noDivisions = true;
      }

    }, (err) => {
      console.log(err);
    });
  }
}
