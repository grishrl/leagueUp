import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AclServiceService } from '../acl-service.service';
import { cloneDeep } from 'lodash';

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
        console.log('res ', res);
        if (res.adminRights != null || res.adminRights != undefined){
          let key = Object.keys(res.adminRights);
          key.forEach(element => {
            this.rights.forEach((statRight) => {
              if (element == statRight.key) {
                statRight.value = true;
              }
            });
          });
        }else{
          res.adminRights = {};
          // this.rights.forEach((statRight) => {
          //     console.log(statRight);
          //   });
        }
        


        this.user = res;
      },
      (err)=>{
        console.log(err);
      }
    )
  }

  //updates the user rights
  updateUserRights(){
    let resultantACL = {};
    this.rights.forEach(right=>{
      if(right.value){
        resultantACL[right.key]=right.value;
      }
    });
    resultantACL['adminId'] = this.user['_id'];
    this.adminService.upsertUserAcls(resultantACL).subscribe(res=>{
      this.router.navigate(['/_admin/userACLMgmt']);
    },err=>{
      console.log(err)
    })
  }

}
