import { Component, Input, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-verified-storm-ranks-display-name',
  templateUrl: './verified-storm-ranks-display-name.component.html',
  styleUrls: ['./verified-storm-ranks-display-name.component.css']
})
export class VerifiedStormRanksDisplayNameComponent implements OnInit {

  constructor(private User:UserService) { }

  @Input() admin = false;

  @Input() set displayName(val){
    if(val){
      this.disName = val;
          this.User.getUser(val).subscribe(
            (res) => {
              this.userProfile = res;
            },
            (err) => {
              console.warn(err);
            }
          );
    }
  };

  disName;
  userProfile;

  ngOnInit(): void {

  }

}
