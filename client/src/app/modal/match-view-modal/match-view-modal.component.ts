import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, NavigationStart } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-match-view-modal',
  templateUrl: './match-view-modal.component.html',
  styleUrls: ['./match-view-modal.component.css']
})
export class MatchViewModalComponent implements OnInit {
  navStart: Observable<NavigationStart>;

  ngOnInit(): void {

    this.navStart.subscribe(evt => {
      this.dialogRef.close();
    });
  }

  matchObj: any;

  constructor(
    public dialogRef: MatDialogRef<MatchViewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private router: Router) {
      this.navStart = this.router.events.pipe(
        filter(evt => evt instanceof NavigationStart)
      ) as Observable<NavigationStart>
    }


}
export interface DialogData {
  confirm: string
  match:object
}
