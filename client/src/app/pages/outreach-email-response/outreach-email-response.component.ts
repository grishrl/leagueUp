import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-outreach-email-response',
  templateUrl: './outreach-email-response.component.html',
  styleUrls: ['./outreach-email-response.component.css']
})
export class OutreachEmailResponseComponent implements OnInit {

  referralKey
  constructor(private route:ActivatedRoute, private auth: AuthService) {
    if(route.snapshot.params['id']){
      auth.setReferral(route.snapshot.params['id']);
    }
   }

  ngOnInit() {
  }

}
