import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-update-roles',
  templateUrl: './update-roles.component.html',
  styleUrls: ['./update-roles.component.css']
})
export class UpdateRolesComponent implements OnInit {

  recId;
  user = {
    displayName:'',
    adminRights:{}
  };
  constructor(private adminService: AdminService, private route: ActivatedRoute, private router: Router) {
    if (this.route.snapshot.params['id']) {
      this.recId = this.route.snapshot.params['id'];
    }
   }


  rights = [
    { key:"TEAM", value: false},
    { key:"USER", value: false},
    { key:"DIVISON", value: false},
    { key:"STANDINGS", value: false},
    { key:"CASTER", value: false},
    { key:"MATCH", value: false},
    { key: "SCHEDULEGEN", value:false}
  ];

  ngOnInit() {
    this.adminService.getUserAcls(this.recId).subscribe(
      (res)=>{
        console.log("RES ", res);
        if(res.adminRights){
          delete res.adminRights.adminId;
          delete res.adminRights.__v;
          delete res.adminRights._id;
        }
        let key = Object.keys(res.adminRights);
        key.forEach(element=>{
          this.rights.forEach((statRight)=>{
            if (element == statRight.key){
              statRight.value=true;
            }
          });
        })
        this.user = res;
      },
      (err)=>{
        console.log(err);
      }
    )
  }

  updateUserRights(){
    let resultantACL = {};
    this.rights.forEach(right=>{
      if(right.value){
        resultantACL[right.key]=right.value;
      }
    });
    resultantACL['adminId'] = this.user['_id'];
    console.log(resultantACL);
    this.adminService.upsertUserAcls(resultantACL).subscribe(res=>{
      console.log('saved! ', res);
      this.router.navigate(['/_admin/userACLMgmt']);
    },err=>{
      console.log(err)
    })
  }

}
