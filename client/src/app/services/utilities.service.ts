import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor() { }

  returnBoolByPath(obj, path): boolean {
    //path is a string representing a dot notation object path;
    //create an array of the string for easier manipulation
    let pathArr = path.split('.');
    //return value
    let retVal = null;
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
    return !!retVal;
  }
}
