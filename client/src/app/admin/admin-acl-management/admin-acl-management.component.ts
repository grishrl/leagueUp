import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-admin-acl-management',
  templateUrl: './admin-acl-management.component.html',
  styleUrls: ['./admin-acl-management.component.css']
})
export class AdminAclManagementComponent implements OnInit {

  constructor(private adminService:AdminService) { }

  users:any = [];
  ngOnInit() {
    this.adminService.getUsersAcls().subscribe(
      (res)=>{this.users = res;
        this.users.forEach(element => {
          if (element.adminRights){
            delete element.adminRights.adminId;
            delete element.adminRights.__v;
            delete element.adminRights._id;
          }
        });
      // console.log(this.users)},
    (err)=>{ console.log(err);}
    )
  }

}
