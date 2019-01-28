import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public subj_notification: Subject<string> = new Subject();
  public updateMessages : Subject<string> = new Subject();
  public updateLogin : Subject<string> = new Subject();
  constructor() { }
}
