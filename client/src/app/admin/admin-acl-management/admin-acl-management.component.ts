import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { AclServiceService } from './acl-service.service';

@Component({
  selector: 'app-admin-acl-management',
  templateUrl: './admin-acl-management.component.html',
  styleUrls: ['./admin-acl-management.component.css']
})
export class AdminAclManagementComponent implements OnInit {

  //component properties
  users: any = [];

  constructor(private adminService:AdminService, private aclService: AclServiceService) { }

  ngOnInit() {
    this.adminService.getUsersAcls().subscribe(
      (res)=>{
        //assign return to local property
        this.users = res;
        this.users.forEach(element => {
          element = this.aclService.removeUnwantedProps(element);
        })
      },
    (err)=>{ console.log(err);}
    )
  }
}
