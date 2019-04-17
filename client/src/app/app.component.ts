import { Component } from '@angular/core';
import * as $ from 'jquery';
import { MatSnackBar } from '@angular/material';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor(private notificationService:NotificationService, private snackBar:MatSnackBar){
    this.notificationService.subj_notification.subscribe(
      message=>{
        this.snackBar.open(message, 'Dismiss', { duration: 2500});
      }
    )
  }

}
