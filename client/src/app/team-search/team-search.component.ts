import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-team-search',
  templateUrl: './team-search.component.html',
  styleUrls: ['./team-search.component.css']
})
export class TeamSearchComponent implements OnInit {

  priorSelect: any
  lastChange: number = 0;
  selectedTeam: any
  btnTxt: string
  cantClick: boolean = false;

  //needs some work ...
  // disableButton() {
  //   console.log('this.priorSelect ', this.priorSelect);
  //   console.log('this.selectedUser ', this.selectedUser);
  //   if (this.priorSelect != undefined && this.priorSelect != null
  //     || this.selectedUser != null && this.selectedUser != undefined) {
  //     if (this.priorSelect == this.selectedUser) {
  //       console.log('returning true A ')
  //       return true;
  //     } else {
  //       console.log('returning false B ')
  //       return false;
  //     }
  //   } else {
  //     console.log('returning false C ')
  //     return false;
  //   }
  // }

  @Output() teamSelected = new EventEmitter();

  nameSelect(user) {
    this.priorSelect = user;
    this.teamSelected.emit(user);
  }

  @Input() set buttonText(text) {
    if (text != undefined && text != null) {
      this.btnTxt = text;
    } else {
      this.btnTxt = "Seach";
    }
  }

  teamCtrl = new FormControl();
  foundTeams: any[]
  search: string

  constructor(private team: TeamService) {
    this.teamCtrl.valueChanges.subscribe(
      data => {
        if (data && data.length > 2) {
          //give this a delay so we don't swamp the server with calls! .875 seconds to make call
          let timestamp = Date.now();
          if (timestamp - this.lastChange > 1000) {
            this.lastChange = timestamp;
            this.team.teamSearch(data).subscribe(res => {
              this.foundTeams = res;
            });
          }
        }


      }
    )

  }

  ngOnInit() {

  }

}
