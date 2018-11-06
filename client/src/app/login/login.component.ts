import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  profile: String

  constructor(private route: ActivatedRoute, private Auth: AuthService, private router: Router, private user : UserService ) {
    if(route.snapshot.params['token']){
      let URI = decodeURIComponent(route.snapshot.params['token']);
      
      let parsed = JSON.parse(URI);

      console.log('parsed ',parsed )
      
      Auth.createAuth(parsed.token, parsed.displayName, parsed.teamInfo);
      console.log('init in login ', Auth.getReferral());
      if (Auth.getReferral()) {
        this.user.outreachResponse(Auth.getReferral()).subscribe((res) => {
          Auth.destroyReferral();
        }, (err) => { Auth.destroyReferral();});
      } else if (Auth.isAuthenticated()) {
        this.profile = user.routeFriendlyUsername(Auth.getUser());
      }
      
      router.navigateByUrl('/profile/'+user.routeFriendlyUsername(parsed.displayName));
    }
   }

  ngOnInit() {

  }

}
