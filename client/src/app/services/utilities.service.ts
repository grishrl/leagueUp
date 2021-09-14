import { Injectable } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { environment } from '../../environments/environment';
import * as moment from 'moment-timezone';
import { Match } from '../classes/match.class';
import { forEach } from 'lodash';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: "root"
})
export class UtilitiesService {
  constructor(private HttpService:HttpService) {}

  getYtO():Observable<any>{
    let url = 'api/utility/ytoa';
    return this.HttpService.httpGet(url,[]);
  }

  objectCopy(obj){
    return JSON.parse( JSON.stringify(obj) );
  }

  calculateRounds(div): Array<number> {
    let provDiv = div;
    let roundNumber = 0;
    let drr = false;
    if (provDiv && provDiv.DRR) {
      drr = true;
    }

    if (
      provDiv != undefined &&
      provDiv != null &&
      provDiv.teams != undefined &&
      provDiv.teams != null
    ) {
      if (provDiv.teams.length % 2 == 0) {
        roundNumber = provDiv.teams.length - 1;
      } else {
        roundNumber = provDiv.teams.length;
      }
    }
    // roundNumber = this.selectedDivision.teams.length - 1;
    let rounds = [];
    if (roundNumber == 0) {
      roundNumber = 1;
    }
    if (drr) {
      roundNumber = roundNumber * 2;
    }
    for (let i = 0; i < roundNumber; i++) {
      rounds.push(i + 1);
    }
    return rounds;
  }

  //this method is terrible
  isNullOrEmpty(dat): boolean {
    if (dat == null || dat == undefined) {
      return true;
    }
    if (typeof dat == "boolean") {
      return false;
    }
    if (Array.isArray(dat)) {
      if (dat.length == 0) {
        return true;
      }
    } else if (typeof dat == "object") {
      let noe = true;
      for (let key in dat) {
        if (this.isNullOrEmpty(dat[key])) {
          noe = false;
        }
      }
      return noe;
    } else if (typeof dat == "string") {
      return dat.length == 0;
    } else {
      return false;
    }
  }

  prePendHttp(link) {
    if (link != undefined && link != null) {
      if (link.includes("http://") || link.includes("https://")) {
        return link;
      } else {
        return "http://" + link;
      }
    } else {
      return link;
    }
  }

  getTimeFromMS(msDate) {
    let time = moment(parseInt(msDate));
    // this.friendlyDate = time;
    // this.suffix = 'AM';
    let hours = time.hours();
    if (hours > 12) {
      hours = hours - 12;
    }
    let min = time.minutes();
    let minStr;
    if (min == 0) {
      minStr = "00";
    } else {
      minStr = min.toString();
    }
    return hours + ":" + minStr;
  }

  dayOfWeekAsString(dayIndex) {
    return [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ][dayIndex];
  }

  getDateFormatStr(showTimeZone: boolean = false): string {
    let displayStr = "dddd M/D/YYYY";
    if (showTimeZone) {
      displayStr += " zz";
    }

    return displayStr;
  }

  // Formats a date using momentjs. See https://momentjs.com/docs/#/displaying/
  // for more information. timeZone can be used to be specific, or leave null
  // to use the browser local timezone.
  getFormattedDate(time, format: string, timeZone: string = null): string {
    if (!(time instanceof Date)) {
      time = new Date(parseInt(time));
    }

    timeZone = timeZone || moment.tz.guess();

    let localMoment = moment(time).tz(timeZone);
    return localMoment.format(format);
  }

  getDateFromMS(msDate) {
    let time = new Date(parseInt(msDate));
    return this.getFormattedDate(time, "dddd M/D/YYYY");
  }

  getSuffixFromMS(msDate) {
    let suffix = "AM";
    let time = new Date(parseInt(msDate));
    let hours = time.getHours();
    if (hours > 12) {
      hours = hours - 12;
      suffix = "PM";
    }
    return suffix;
  }

  markFormGroupTouched(formGroup: FormGroup) {
    if (formGroup.controls) {
      const keys = Object.keys(formGroup.controls);
      for (let i = 0; i < keys.length; i++) {
        const control = formGroup.controls[keys[i]];

        if (control instanceof FormControl) {
          control.markAsTouched();
        } else if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    }
  }

  updateAvailabilityToNum(obj) {
    let keys = Object.keys(obj.availability);
    keys.forEach(element => {
      let day = obj.availability[element];
      if (day.available) {
        day["startTimeNumber"] = this.convertToMil(day.startTime);
        day["endTimeNumber"] = this.convertToMil(day.endTime);
      }
    });
  }

  convertToMil(time) {
    if (typeof time === "string") {
      let colonSplit = time.split(":");
      return parseInt(colonSplit[0]) * 100 + parseInt(colonSplit[1]);
    } else {
      return null;
    }
  }

  zeroGMT(time, timezone) {
    let localTime = time;
    if (typeof localTime === "string") {
      localTime = this.convertToMil(localTime);
    }
    timezone = parseInt(timezone);
    let correct = localTime - timezone * 100;
    return correct;
  }

  returnBoolByPath(obj, path): boolean {
    //path is a string representing a dot notation object path;
    //create an array of the string for easier manipulation
    let pathArr = path.split(".");
    //return value
    let retVal = null;

    if (obj == null || obj == undefined) {
      retVal = false;
    } else {
      //get the first element of the array for testing
      let ele = pathArr[0];
      //make sure the property exist on the object
      if (obj.hasOwnProperty(ele)) {
        if (typeof obj[ele] == "boolean") {
          retVal = true;
        }
        //property exists:
        //property is an object, and the path is deeper, jump in!
        else if (typeof obj[ele] == "object" && pathArr.length > 1) {
          //remove first element of array
          pathArr.splice(0, 1);
          //reconstruct the array back into a string, adding "." if there is more than 1 element
          if (pathArr.length > 1) {
            path = pathArr.join(".");
          } else {
            path = pathArr[0];
          }
          //recurse this function using the current place in the object, plus the rest of the path
          retVal = this.returnBoolByPath(obj[ele], path);
        } else if (typeof obj[ele] == "object" && pathArr.length == 0) {
          retVal = obj[ele];
        } else {
          retVal = obj[ele];
        }
      }
      if (typeof retVal == "number" && retVal == 0) {
        retVal = 1;
      }
    }

    return !!retVal;
  }

  returnByPath = function(obj, path) {
    //path is a string representing a dot notation object path;
    //create an array of the string for easier manipulation
    let pathArr = path.split(".");
    //return value
    let retVal = null;
    //get the first element of the array for testing
    let ele = pathArr[0];
    //make sure the property exist on the object
    if (obj.hasOwnProperty(ele)) {
      //property exists:
      //property is an object, and the path is deeper, jump in!
      if (typeof obj[ele] == "object" && pathArr.length > 1) {
        //remove first element of array
        pathArr.splice(0, 1);
        //reconstruct the array back into a string, adding "." if there is more than 1 element
        if (pathArr.length > 1) {
          path = pathArr.join(".");
        } else {
          path = pathArr[0];
        }
        //recurse this function using the current place in the object, plus the rest of the path
        retVal = this.returnByPath(obj[ele], path);
      } else if (typeof obj[ele] == "object" && pathArr.length == 0) {
        retVal = obj[ele];
      } else {
        retVal = obj[ele];
      }
    }
    return retVal;
  };

  generalImageFQDN(img) {
    let imgFQDN =
      "https://s3.amazonaws.com/" + environment.s3bucketGeneralImage + "/";
    if (img) {
      imgFQDN += img;
    } else {
    }
    return imgFQDN;
  }

  sortTeams(teams) {
    teams = teams.sort((a, b) => {
      if (a.teamName_lower > b.teamName_lower) {
        return 1;
      } else {
        return -1;
      }
    });
    return teams;
  }

  sortMatchesByTime(matches) {
    return matches.sort((a, b) => {
      let ret = 0;
      if (!this.returnBoolByPath(a, "scheduledTime.startTime")) {
        ret = -1;
      } else if (!this.returnBoolByPath(b, "scheduledTime.startTime")) {
        ret = -1;
      } else {
        if (
          parseInt(a.scheduledTime.startTime) >
          parseInt(b.scheduledTime.startTime)
        ) {
          ret = 1;
        } else {
          ret = -1;
        }
      }
      return ret;
    });

  }

  hasMapBans(match: Match): boolean {
    if (
      match.mapBans &&
      match.mapBans.awayOne &&
      match.mapBans.awayTwo &&
      match.mapBans.homeOne &&
      match.mapBans.homeTwo
    ) {
      return true;
    }

    return false;
  }

  replayFQDN(replay) {
    let url =
      "https://s3.amazonaws.com/" + environment.s3bucketReplays + "/" + replay;
    return url;
  }

  returnMSFromFriendlyDateTime(val, time, suffix) {
    //date in moment or date format...
    let m = moment(val);
    let year = m.year();
    let month = m.month();
    let date = m.date();
    let setDate = moment();
    setDate.year(year);
    setDate.month(month);
    setDate.date(date);
    setDate
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);

    let colonSplit = time.split(":");
    colonSplit[1] = parseInt(colonSplit[1]);
    if (suffix == "PM") {
      colonSplit[0] = parseInt(colonSplit[0]);
      colonSplit[0] += 12;
    }

    setDate
      .hour(colonSplit[0])
      .minutes(colonSplit[1])
      .seconds(0)
      .milliseconds(0);

    let msDate = setDate.unix() * 1000;
    return msDate;
  }

  async imageToPng(blob) {
    // if (blob.type === "image/png") {
    //   return blob;
    // }

    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = URL.createObjectURL(blob);
    });
    const canvas = Object.assign(document.createElement("canvas"), {
      width: image.naturalWidth,
      height: image.naturalHeight
    });
    canvas.getContext("2d").drawImage(image, 0, 0);
    URL.revokeObjectURL(image.src);
    return new Promise(resolve => canvas.toBlob(resolve, "image/png", 0.3));
  }

  validateClipUrl(url) {
    const blacklist = [];
    let valid = true;
    let returnClip = "";
    if (
      url.includes("twitch.tv") ||
      url.includes("youtube.com/watch") ||
      url.includes("youtu.be")
    ) {
      forEach(blacklist, val => {
        if (url.includes(val)) {
          valid = false;
        }
      });
      let clipVal = "";
      if (url.includes("twitch.tv")) {
        returnClip = "clips.twitch.tv/embed?clip=";
        let clipStr = "clip=";
        if (url.includes(clipStr)) {
          let index = url.indexOf(clipStr);
          clipVal = url.substring(index + clipStr.length, url.length);
        } else {
          let twitchTLD = "clips.twitch.tv/";
          let index = url.indexOf(twitchTLD);
          clipVal = url.substring(index + twitchTLD.length, url.length);
        }
        if (
          clipVal.length > 0 &&
          clipVal.toLowerCase().includes("autoplay=false") == false
        ) {
          returnClip += clipVal + `&autoplay=false`;
        } else {
          returnClip += clipVal;
        }
      } else if (url.includes("youtu.be")) {
        returnClip = "https://www.youtube.com/embed/";
        let youtubeTLD = "https://youtu.be/";
        clipVal = url.substring(youtubeTLD.length, url.length);
        if (clipVal.length > 0) {
          returnClip += clipVal;
        }
      } else if (url.includes("youtube.com/watch")) {
        returnClip = "https://www.youtube.com/embed/";
        let clipStr = "watch?v=";
        let index = url.indexOf(clipStr);
        clipVal = url.substring(index + clipStr.length, url.length);
        if (clipVal.length > 0) {
          returnClip += clipVal;
        }
      } else if (url.includes("https://www.youtube.com/embed/")) {
        returnClip = url;
      }
    } else {
      valid = false;
    }
    if(!valid){
      alert('This URL is not accepted, only accepts URLs from youtube or twitch!');
    }

    if(returnClip.length == 0){
      alert(
        "Unable to extract the clip info in the format provided, please try again."
      );
    }
    return { valid, returnClip };
  }

  validateClipUrl2(url){
        const blacklist = [];
    let valid = false;
    let returnClip = "";
    if (
      url.includes("twitch.tv") ||
      url.includes("youtube.com") ||
      url.includes("youtu.be")
    ) {
      blacklist.forEach(val => {
        if (url.includes(val)) {
          valid = false;
        }
      })
    }else{
      valid = false;
    }

    let obj = getAllUrlParams(url, false);

    if(this.returnBoolByPath(obj, 'v') ){
      valid = true;
      returnClip = this.returnByPath(obj, 'v') ;

    }else if(this.returnBoolByPath(obj, 'vi')){
      returnClip =this.returnByPath(obj, 'vi');
    }

    if(!valid){
            alert("Unable to parse this url for valid link, please try again.");
    }

    return {valid, returnClip};
  }

  twitchEmbeddify(clip){
    let obj = this.validateClipUrl2(clip);
    if(obj.valid){
      let embeddClip = 'clips.twitch.tv/embed?clip=' + obj.returnClip + '&autoplay=false';
      obj.returnClip = embeddClip
    }
    return obj;
  }

}

  function getAllUrlParams(url, forceLower) {

    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // we'll store the parameters here
    var obj = {};

    // if query string exists
    if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        var arr = queryString.split('&');

        for (var i = 0; i < arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split('=');

            // set parameter name and value (use 'true' if empty)
            var paramName = a[0];
            var paramValue = typeof(a[1]) === 'undefined' ? true : a[1];

            // (optional) keep case consistent
            paramName = paramName;
            if (forceLower) {
                paramName = paramName.toLowerCase();
            }

            if (typeof paramValue === 'string') paramValue = forceLower ? paramValue.toLowerCase() : paramValue;

            // if the paramName ends with square brackets, e.g. colors[] or colors[2]
            if (paramName.match(/\[(\d+)?\]$/)) {

                // create key if it doesn't exist
                var key = paramName.replace(/\[(\d+)?\]/, '');
                if (!obj[key]) obj[key] = [];

                // if it's an indexed array e.g. colors[2]
                if (paramName.match(/\[\d+\]$/)) {
                    // get the index value and add the entry at the appropriate position
                    var index = /\[(\d+)\]/.exec(paramName)[1];
                    obj[key][index] = paramValue;
                } else {
                    // otherwise add the value to the end of the array
                    obj[key].push(paramValue);
                }
            } else {
                // we're dealing with a string
                if (!obj[paramName]) {
                    // if it doesn't exist, create property
                    obj[paramName] = paramValue;
                } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                    // if property does exist and it's a string, convert it to an array
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(paramValue);
                } else {
                    // otherwise add the property
                    obj[paramName].push(paramValue);
                }
            }
        }
    }

    if (Object.keys(obj).length == 0) {
        let urlArr = url.split('/');
        obj['v'] = urlArr[urlArr.length - 1];
    }

    return obj;
}
