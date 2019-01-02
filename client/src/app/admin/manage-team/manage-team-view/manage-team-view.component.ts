import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-manage-team-view',
  templateUrl: './manage-team-view.component.html',
  styleUrls: ['./manage-team-view.component.css']
})
export class ManageTeamViewComponent implements OnInit {

  //component properties
  recievedProfile:string = '';

  constructor(private route:ActivatedRoute) { 
    if (this.route.snapshot.params['id']) {
      this.recievedProfile = this.route.snapshot.params['id'];
    }
  }

  ngOnInit() {
  }

}
