import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { TimeService } from 'src/app/services/time.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-team-registered',
  templateUrl: './team-registered.component.html',
  styleUrls: ['./team-registered.component.css']
})
export class TeamRegisteredComponent implements OnInit {

  registrationOpen;
  constructor(private Auth:AuthService, private TimeServ:TimeService, private util:UtilitiesService) {

    this.TimeServ.getSesasonInfo().subscribe(
      res=>{
        this.registrationOpen = res.registrationOpen;
        this.ngOnInit();
      }
    );
   }

   hidden=true;

   @Input() team;

  ngOnInit(): void {
    if(this.Auth.getCaptain()=='true' && this.registrationOpen){
      if(this.util.returnBoolByPath(this.team, 'questionnaire.registered')){
        this.hidden = false;
      }
    }
  }

}
