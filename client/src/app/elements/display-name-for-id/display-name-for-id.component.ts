import { Component, OnInit, Input } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-display-name-for-id',
  templateUrl: './display-name-for-id.component.html',
  styleUrls: ['./display-name-for-id.component.css']
})
export class DisplayNameForIdComponent implements OnInit {

  constructor(private userServ:UserService) { }

  @Input() userId;

  userName;

  ngOnInit(): void {

    this.userServ.cachedGetUserNameFromId(this.userId).subscribe((res) => {
      this.userName = res.displayName;
    });

  }

}
