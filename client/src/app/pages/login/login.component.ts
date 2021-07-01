import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  profile: string

  constructor(private route: ActivatedRoute, public Auth: AuthService, private router: Router, private user : UserService ) {
    if(route.snapshot.params['token']){
      let URI = decodeURIComponent(route.snapshot.params['token']);

      let parsed = JSON.parse(URI);

      Auth.createAuth(parsed.token);

      if (Auth.getReferral()) {
        this.user.outreachResponse(Auth.getReferral(), Auth.getUser()).subscribe((res) => {
          Auth.destroyReferral();
        }, (err) => { Auth.destroyReferral();});
      } else if (Auth.isAuthenticated()) {
        this.profile = user.routeFriendlyUsername(Auth.getUser());
      }

      router.navigateByUrl('/profile/'+user.routeFriendlyUsername(Auth.getUser()));
    }
   }

  ngOnInit() {

  }

}
