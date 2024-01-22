import { Component } from '@angular/core';
import * as $ from 'jquery';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './services/notification.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor(private notificationService:NotificationService, private snackBar:MatSnackBar, private router:Router){
    this.notificationService.subj_notification.subscribe(
      message=>{
        this.snackBar.open(message, 'Dismiss', { duration: 3000});
      }
    );
    this.router.events.subscribe( event=>{
      if(event instanceof NavigationEnd){
        (<any>window).gtag('config', 'UA-130248168-2',
        {
          'page_path': event.urlAfterRedirects
        });
      }

    })
  }

}
