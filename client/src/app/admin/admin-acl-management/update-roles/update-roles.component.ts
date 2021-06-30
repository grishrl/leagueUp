import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AclServiceService } from '../acl-service.service';
import { cloneDeep } from 'lodash';
import { forEach as _forEach } from 'lodash'

@Component({
  selector: 'app-update-roles',
  templateUrl: './update-roles.component.html',
  styleUrls: ['./update-roles.component.css']
})
export class UpdateRolesComponent implements OnInit {

  //local component properties
  recId; // local var  for id recieved in route
  user = {
    displayName:'',
    adminRights:{}
  };  //prototype user object
  rights: any //application rights

  constructor(private adminService: AdminService, private route: ActivatedRoute, private router: Router, private aclSerive:AclServiceService) {
    //get id from route
    if (this.route.snapshot.params['id']) {
      this.recId = this.route.snapshot.params['id'];
    }
   }




  ngOnInit() {
    //assign rights from the service to the local var
    this.rights = cloneDeep(this.aclSerive.rights);
    //get the users ACLs provided in the route
    this.adminService.getUserAcls(this.recId).subscribe(
      (res)=>{
        res = this.aclSerive.removeUnwantedProps(res);
        if (res.adminRights != null || res.adminRights != undefined) {
          _forEach(res.adminRights, (value, key)=>{
            this.rights.forEach((statRight) => {
              if (key == statRight.key) {
                statRight.value = value;
              }
            });
          })
        } else {
          res.adminRights = {};
        }



        this.user = res;
      },
      (err)=>{
        console.warn(err);
      }
    )
  }

  //updates the user rights
  updateUserRights(){
    let resultantACL = {};
    this.rights.forEach(right=>{

        resultantACL[right.key]=right.value;

    });
    resultantACL['adminId'] = this.user['_id'];
    this.adminService.upsertUserAcls(resultantACL).subscribe(res=>{
      this.router.navigate(['/_admin/userACLMgmt']);
    },err=>{
      console.warn(err)
    })
  }

}
