import { Component, OnInit, Input } from '@angular/core';
import { MvpService } from 'src/app/services/mvp.service';
import { forEach } from 'lodash';
import { url } from 'inspector';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-mvp-report',
  templateUrl: './mvp-report.component.html',
  styleUrls: ['./mvp-report.component.css']
})
export class MvpReportComponent implements OnInit {

  constructor(private mvpServ: MvpService, private util:UtilitiesService) { }

  mvpPlayer:string;
  potgUrl:string;

  warning = "Not reported";

  allMembers = [];
  @Input() set members(val){
    this.allMembers = val;
  }

  matchIdVal;
  @Input() set matchId(val){
    this.matchIdVal = val;
  }

  origRes;

  mvpObj = {
    "match_id":"",
    "player_id":"",
    "potg_link":"",
    "displayName":""
  };

  ngOnInit(): void {
    this.mvpServ.getMvpById('match_id', this.matchIdVal).subscribe(
      res=>{
        this.processResponse(res);
      },
      err=>{
        console.log('err',err);
      }
    )
  }

  disableSubmit = false;
  disablePlayerEdit = false;
  disableUrlEdit = false;


  private processResponse(res: any) {
    if (res) {
      if (!res || !res.match_id) {
        res.match_id = this.matchIdVal;
        }
      this.origRes = Object.assign({},res);
      this.mvpObj = res;
      if (res.displayName) {
        this.disablePlayerEdit = true;
        this.warning = "MVP Player reported, no potg URL";
      }
      if (res.potg_link) {
        this.disableUrlEdit = true;
        this.warning = "PotG Rerported, no MVP Player";
      }
      if (this.disableUrlEdit && this.disablePlayerEdit) {
        this.disableSubmit = true;
        this.warning = "";
      }

    }
  }

  report(){
    if(!this.disableSubmit){
      if(this.validate(this.origRes, this.mvpObj)){
        if(!this.mvpObj.match_id){
          this.mvpObj.match_id = this.matchIdVal;
        }
        //require some input before creating the post...
        if (this.mvpObj.displayName || this.mvpObj.potg_link) {
          if (this.mvpObj.potg_link) {
            let urlObj = this.util.validateClipUrl(this.mvpObj.potg_link);
            if (urlObj.valid) {
              this.mvpObj.potg_link = urlObj.returnClip;
              this.mvpServ.upsertMvp(this.mvpObj).subscribe(
                res => {
                  this.processResponse(res);
                },
                err => {
                  console.log("MVP Submit: ", err);
                }
              );
            }
          } else if (this.mvpObj.displayName) {
            this.mvpServ.upsertMvp(this.mvpObj).subscribe(
              res => {
                this.processResponse(res);
              },
              err => {
                console.log("MVP Submit: ", err);
              }
            );
          }
        } else {
          alert("Must enter some information");
        }
    }
  }
}

  private validate(obj1, obj2) {
  if (obj1) {
    let valid = true;
    forEach(obj1, (val, key) => {

        if (obj2[key] != null || obj2[key]!=undefined) {
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

// function validateUrl(url) {
//   const blacklist = [];
//   console.log(url);
//   let valid = true;
//   let returnClip = "";
//   if (
//     url.includes("twitch.tv") ||
//     url.includes("youtube.com/watch") ||
//     url.includes("youtu.be")
//   ) {
//     forEach(blacklist, val => {
//       if (url.includes(val)) {
//         valid = false;
//       }
//     });
//     let clipVal = "";
//     if (url.includes("twitch.tv")) {
//       returnClip = "https://clips.twitch.tv/embed?clip=";
//       let clipStr = "clip=";
//       if (url.includes(clipStr)) {
//         let index = url.indexOf(clipStr);
//         clipVal = url.substring(index + clipStr.length, url.length);
//       } else {
//         let twitchTLD = "https://clips.twitch.tv/";
//         let index = url.indexOf(twitchTLD);
//         clipVal = url.substring(index + twitchTLD.length, url.length);
//       }
//       if (clipVal.length > 0) {
//         returnClip += clipVal;
//       }
//     } else if (url.includes("youtu.be")) {
//       returnClip = "https://www.youtube.com/embed/";
//       let youtubeTLD = "https://youtu.be/";
//       clipVal = url.substring(youtubeTLD.length, url.length);
//       if (clipVal.length > 0) {
//         returnClip += clipVal;
//       }
//     } else if (url.includes("youtube.com/watch")) {
//       returnClip = "https://www.youtube.com/embed/";
//       let clipStr = "watch?v=";
//       let index = url.indexOf(clipStr);
//       clipVal = url.substring(index + clipStr.length, url.length);
//       if (clipVal.length > 0) {
//         returnClip += clipVal;
//       }
//     } else if (url.includes("https://www.youtube.com/embed/")) {
//       returnClip = url;
//     }
//   } else {
//     valid = false;
//   }
//   return { valid, returnClip };
// }
