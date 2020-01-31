import { Injectable } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { environment } from '../../environments/environment';
import * as moment from 'moment-timezone';
import { Match } from '../classes/match.class';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor() { }

  //this method is terrible
  isNullOrEmpty(dat): boolean {
    if (dat == null || dat == undefined) {
      return true;
    }
    if(typeof dat == 'boolean'){
      return false;
    }
    if (Array.isArray(dat)) {
      if (dat.length == 0) {
        return true;
      }
    } else if (typeof dat == 'object') {
      let noe = false;
      for (let key in dat) {
        if (this.isNullOrEmpty(dat[key])) {
          noe = true;
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
      if (link.includes('http://') || link.includes('https://')) {
        return link;
      } else {
        return 'http://' + link;
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
      minStr = '00';
    } else {
      minStr = min.toString();
    }
    return hours + ":" + minStr
  }

  dayOfWeekAsString(dayIndex) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
  }

  getDateFormatStr(showTimeZone: boolean = false) : string {
    let displayStr = "dddd M/D/YYYY";
    if (showTimeZone) {
      displayStr += " zz";
    }

    return displayStr;
  }

  // Formats a date using momentjs. See https://momentjs.com/docs/#/displaying/
  // for more information. timeZone can be used to be specific, or leave null
  // to use the browser local timezone.
  getFormattedDate(time, format: string, timeZone: string = null) : string {
    if (!(time instanceof Date)){
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
    let suffix = 'AM';
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
        day['startTimeNumber'] = this.convertToMil(day.startTime);
        day['endTimeNumber'] = this.convertToMil(day.endTime);
      }
    });
  }


  convertToMil(time) {
    if (typeof time === 'string') {
      let colonSplit = time.split(':');
      return parseInt(colonSplit[0]) * 100 + parseInt(colonSplit[1]);
    } else {
      return null;
    }
  }

  zeroGMT(time, timezone) {
    let localTime = time;
    if (typeof localTime === 'string') {
      localTime = this.convertToMil(localTime);
    }
    timezone = parseInt(timezone);
    let correct = localTime - (timezone * 100);
    return correct;
  }

  returnBoolByPath(obj, path): boolean {
    //path is a string representing a dot notation object path;
    //create an array of the string for easier manipulation
    let pathArr = path.split('.');
    //return value
    let retVal = null;

    if(obj == null || obj == undefined){
      retVal = false;
    }else{
      //get the first element of the array for testing
      let ele = pathArr[0];
      //make sure the property exist on the object
      if (obj.hasOwnProperty(ele)) {
        if (typeof obj[ele] == 'boolean') {
          retVal = true;
        }
        //property exists:
        //property is an object, and the path is deeper, jump in!
        else if (typeof obj[ele] == 'object' && pathArr.length > 1) {
          //remove first element of array
          pathArr.splice(0, 1);
          //reconstruct the array back into a string, adding "." if there is more than 1 element
          if (pathArr.length > 1) {
            path = pathArr.join('.');
          } else {
            path = pathArr[0];
          }
          //recurse this function using the current place in the object, plus the rest of the path
          retVal = this.returnBoolByPath(obj[ele], path);
        } else if (typeof obj[ele] == 'object' && pathArr.length == 0) {
          retVal = obj[ele];
        } else {
          retVal = obj[ele]
        }
      }
      if (typeof retVal == 'number' && retVal == 0) {
        retVal = 1;
      }
    }

    return !!retVal;
  }

  returnByPath = function (obj, path) {
    //path is a string representing a dot notation object path;
    //create an array of the string for easier manipulation
    let pathArr = path.split('.');
    //return value
    let retVal = null;
    //get the first element of the array for testing
    let ele = pathArr[0];
    //make sure the property exist on the object
    if (obj.hasOwnProperty(ele)) {
      //property exists:
      //property is an object, and the path is deeper, jump in!
      if (typeof obj[ele] == 'object' && pathArr.length > 1) {
        //remove first element of array
        pathArr.splice(0, 1);
        //reconstruct the array back into a string, adding "." if there is more than 1 element
        if (pathArr.length > 1) {
          path = pathArr.join('.');
        } else {
          path = pathArr[0];
        }
        //recurse this function using the current place in the object, plus the rest of the path
        retVal =  this.returnByPath(obj[ele], path);
      } else if (typeof obj[ele] == 'object' && pathArr.length == 0) {
        retVal = obj[ele];
      } else {
        retVal = obj[ele]
      }
    }
    return retVal;
  }

  generalImageFQDN(img) {
    let imgFQDN = 'https://s3.amazonaws.com/' + environment.s3bucketGeneralImage + '/'
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
    matches.sort((a, b) => {
      let ret = 0;
      if (!this.returnBoolByPath(a, 'scheduledTime.startTime')) {
        ret = -1;
      } else if (!this.returnBoolByPath(b, 'scheduledTime.startTime')) {
        ret = -1;
      } else {
        if (parseInt(a.scheduledTime.startTime) > parseInt(b.scheduledTime.startTime)) {
          ret = 1;
        } else {
          ret = -1;
        }
      }
      return ret;
    });
    return matches;
  }

  hasMapBans(match: Match) : boolean {
      if (match.mapBans && match.mapBans.awayOne &&
        match.mapBans.awayTwo &&
        match.mapBans.homeOne &&
        match.mapBans.homeTwo)
        {
          return true;
        }

      return false;
  }


  replayFQDN(replay) {
    let url = 'https://s3.amazonaws.com/' + environment.s3bucketReplays + '/' + replay;
    return url;
  }

  returnMSFromFriendlyDateTime(val, time, suffix){
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

    setDate.hour(colonSplit[0]).minutes(colonSplit[1]).seconds(0).milliseconds(0);

    let msDate = setDate.unix() * 1000;
    return msDate;
  }

}
