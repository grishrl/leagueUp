import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { UserService } from "src/app/services/user.service";
import { TeamService } from "src/app/services/team.service";
import { Profile } from "../../../classes/profile.class";
import { Team } from "../../../classes/team.class";
import { AdminService } from "../../../services/admin.service";
import { UtilitiesService } from "src/app/services/utilities.service";

@Component({
  selector: "app-approve-member-view",
  templateUrl: "./approve-member-view.component.html",
  styleUrls: ["./approve-member-view.component.css"],
})
export class ApproveMemberViewComponent implements OnInit {
  //component properties
  player = new Profile(
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ); //local user profile - blank user profile
  viewTeam = new Team(
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ); //local team profile - blank team profile
  resultantMmr: {
    resultantMmr: null;
    stormRankAvg: null;
  }; //local var for holding returned resultant MMR calculation
  _info: any; //local var, holds the bindings passed to this component
  note: string = "";

  //Input bindings , object that has username and teamname
  @Input() set info(info) {
    if (info != null && info != undefined) {
      this._info = info;
    }
  }

  //Output bindings
  @Output() accountActioned = new EventEmitter();

  //sends events to accountActioned output binding
  accountActioner() {
    this.accountActioned.emit(this._info);
  }

  errorState = false;

  constructor(
    private user: UserService,
    private team: TeamService,
    private admin: AdminService,
    public util: UtilitiesService
  ) {}

  //grabs appropriate team and user information based on privided input binding
  ngOnInit() {
    if (this._info.teamId && this._info.userId) {
      this.user.getUserById(this._info.userId).subscribe((res) => {
        if(res){
          this.player = res;
        }else{
          this.errorState = true;
        }


        this.team.getTeam(null, null, this._info.teamId).subscribe((resT) => {
          this.viewTeam = resT;

          this.admin
            .resultantMmr(
              this.player.heroesProfileMmr,
              this.player.displayName,
              this.viewTeam.teamName_lower
            )
            .subscribe(
              (resmmr) => {
                this.resultantMmr = resmmr.resultantMmr;
              },
              (err) => {
                console.warn(err);
              }
            );
        });
      });
    }
  }

  //handles the approval chosen by the admin
  actionAccount(act) {
    this.admin.queuePost(this.viewTeam._id, this.player._id, act).subscribe(
      (res) => {
        this.accountActioner();
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  submitNote() {
    if (this.note.length > 0) {
      this.admin.pmqAddNote(this._info, this.note).subscribe(
        (res) => {
          this._info = res;
          this.note = "";
        },
        (err) => {
          console.warn(err);
        }
      );
    }
  }

  delete(queue) {
    if (
      confirm(
        "This is a destructive process for user! It COULD remove them from a team, double check afterwards with the user to make sure!"
      )
    ) {
      this.admin.deleteQueueItem(queue).subscribe(
        (res) => {
          this.accountActioner();
        },
        (err) => {
          console.warn(err);
        }
      );
    }
  }
}
