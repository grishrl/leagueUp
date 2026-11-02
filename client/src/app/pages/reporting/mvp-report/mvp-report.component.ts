import { Component, OnInit, Input } from "@angular/core";
import { MvpService } from "src/app/services/mvp.service";
import { forEach } from "lodash";
import { url } from "inspector";
import { UtilitiesService } from "src/app/services/utilities.service";

@Component({
  selector: "app-mvp-report",
  templateUrl: "./mvp-report.component.html",
  styleUrls: ["./mvp-report.component.css"],
})
export class MvpReportComponent implements OnInit {
  constructor(private mvpServ: MvpService, private util: UtilitiesService) {}

  mvpPlayer: string;
  potgUrl: string;

  warning = "Not reported";

  allMembers = [];

  potgExisted:boolean=false;

  @Input() set members(val) {
    this.allMembers = val;
  }

  matchIdVal;

  @Input() set matchId(val) {
    this.matchIdVal = val;
  }

  origRes;

  mvpObj = {
    match_id: "",
    player_id: "",
    potg_link: "",
    displayName: "",
  };

  ngOnInit(): void {
    this.mvpServ.getMvpById("match_id", this.matchIdVal).subscribe(
      (res) => {
        this.processResponse(res);
      },
      (err) => {
        console.warn("err", err);
      }
    );
  }

  disableSubmit = false;
  disablePlayerEdit = false;
  disableUrlEdit = false;

  private processResponse(res: any) {
    if (res) {
      if (!res || !res.match_id) {
        res.match_id = this.matchIdVal;
      }
      this.origRes = Object.assign({}, res);
      this.mvpObj = res;
      if (res.displayName) {
        this.disablePlayerEdit = true;
        this.warning = "MVP Player reported, no potg URL";
      }
      if (res.potg_link) {
        this.potgExisted = true;
        this.disableUrlEdit = true;
        this.warning = "PotG Rerported, no MVP Player";
      }
      if (this.disableUrlEdit && this.disablePlayerEdit) {
        this.disableSubmit = true;
        this.warning = "";
      }
    }
  }

  report() {
    if (!this.disableSubmit) {
      if (this.validate(this.origRes, this.mvpObj)) {
        if (!this.mvpObj.match_id) {
          this.mvpObj.match_id = this.matchIdVal;
        }
        //require some input before creating the post...
        if (this.mvpObj.displayName || this.mvpObj.potg_link) {
          let urlObj = { valid: false, returnClip: "" };
          if (this.mvpObj.potg_link && this.mvpObj.displayName && this.potgExisted == false) {
            urlObj = this.urlValidation(urlObj);
            if (urlObj.valid) {
              this.mvpObj.potg_link = urlObj.returnClip;
              this.mvpServ.upsertMvp(this.mvpObj).subscribe(
                (res) => {
                  this.processResponse(res);
                },
                (err) => {
                  console.warn("MVP Submit: ", err);
                }
              );
            } else {
              alert("Could not extract valid clip url.");
            }
          } else if (
            this.mvpObj.potg_link &&
            this.mvpObj.displayName &&
            this.potgExisted == true
          ) {
              this.mvpServ.upsertMvp(this.mvpObj).subscribe(
                (res) => {
                  this.processResponse(res);
                },
                (err) => {
                  console.warn("MVP Submit: ", err);
                }
              );
          } else if (this.mvpObj.potg_link) {
            urlObj = this.urlValidation(urlObj);
            if (urlObj.valid) {
              this.mvpObj.potg_link = urlObj.returnClip;
              this.mvpServ.upsertMvp(this.mvpObj).subscribe(
                (res) => {
                  this.processResponse(res);
                },
                (err) => {
                  console.warn("MVP Submit: ", err);
                }
              );
            } else {
              alert("Could not extract valid clip url.");
            }
          } else if (this.mvpObj.displayName) {
            urlObj = this.urlValidation(urlObj);
            if (urlObj.valid) {
              this.mvpObj.potg_link = urlObj.returnClip;
            } else {
              this.mvpObj.potg_link = null;
            }
            this.mvpServ.upsertMvp(this.mvpObj).subscribe(
              (res) => {
                this.processResponse(res);
              },
              (err) => {
                console.warn("MVP Submit: ", err);
              }
            );
          }
        } else {
          alert("Must enter some information");
        }
      }
    }
  }

  private urlValidation(urlObj: { valid: boolean; returnClip: string }) {

    if (this.mvpObj.potg_link.includes("twitch")) {
      urlObj = this.util.twitchEmbeddify(this.mvpObj.potg_link);
    } else if (this.mvpObj.potg_link.includes("youtube")) {
      urlObj = this.util.youtubeEmbeddify(this.mvpObj.potg_link);
    }
    return urlObj;
  }

  private validate(obj1, obj2) {
    if (obj1) {
      let valid = true;
      forEach(obj1, (val, key) => {
        if (obj2[key] != null || obj2[key] != undefined) {
          if (!this.util.isNullOrEmpty(val)) {
            if (val == obj2[key]) {
              //the modified object same as original
            } else {
              valid = false;
            }
          }
        } else {
          //property was removed
          valid = false;
        }
      });
      return valid;
    } else {
      return true;
    }
  }
}
