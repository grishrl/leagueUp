import { Component, OnInit, Input } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: "app-player-link",
  templateUrl: "./player-link.component.html",
  styleUrls: ["./player-link.component.css"],
})
export class PlayerLinkComponent implements OnInit {
  constructor(private userService: UserService) {}

  profileLink;
  ngOnInit() {}

  targetVal;
  @Input() set target(val) {
    this.targetVal = val ? val : "_self";
  }

  playerVal: string;
  @Input() set player(val) {
    if (val) {
      this.playerVal = val;
      this.profileLink = this.userService.routeFriendlyUsername(this.playerVal);
    }
  }
}
