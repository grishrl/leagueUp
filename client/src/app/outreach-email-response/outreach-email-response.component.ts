import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-outreach-email-response',
  templateUrl: './outreach-email-response.component.html',
  styleUrls: ['./outreach-email-response.component.css']
})
export class OutreachEmailResponseComponent implements OnInit {

  referralKey
  constructor(private route:ActivatedRoute, private auth: AuthService) {
    if(route.snapshot.params['id']){
      console.log('setting referral code')
      auth.setReferral(route.snapshot.params['id']);
      console.log(auth.getReferral());
    }
   }

  ngOnInit() {
  }

}
