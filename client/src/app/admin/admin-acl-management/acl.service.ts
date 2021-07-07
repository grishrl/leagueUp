import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AclService {

  constructor() { }

  rights = [
    { key: "TEAM", value: false },
    { key: "USER", value: false },
    { key: "DIVISION", value: false },
    { key: "STANDINGS", value: false },
    { key: "CASTER", value: false },
    { key: "MATCH", value: false },
    { key: "SCHEDULEGEN", value: false },
    { key: "ACL", value: false},
    { key: "EVENTS", value: false},
    { key: "LOGS", value: false }
  ];

  removeUnwantedProps(acl){
    if (acl.adminRights) {
      //delete properties we don't want
      delete acl.adminRights.adminId;
      delete acl.adminRights.__v;
      delete acl.adminRights._id;
    }
    return acl;
  }

}
