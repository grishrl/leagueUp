import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private auth:AuthService, private router: Router, private notificationService:NotificationService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {


    let token = this.auth.decryptToken();
    let tokenExp = token.exp*1000;

    if(Date.now() < tokenExp){

      // validating token only, good token foward along route.
    if(next.data.role == 'tokenonly'){
      return true;
    }

    if(next.data.role == 'captain'){
      return !!this.auth.getCaptain();
    }

    // caster route gaurd
    if (next.data.role == 'caster'){

      if(this.auth.getCaster()){
        return true;
      }
    } else if (next.data.role == undefined || next.data.role == null){
      if (this.auth.getAdmin()){
        return true;
      }
    }else if (this.auth.getAdmin().indexOf(next.data.role)>-1){
      return true;
    }
    // navigate to login page
    this.router.navigate(['/noAccess/', next.data.role]);
    // you can save redirect url so after authing we can move them back to the page they requested
    return false;
    }else{
      this.auth.destroyAuth('/');
      this.notificationService.subj_notification.next('Your token has expired.');
    }


  }
}
