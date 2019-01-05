import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { AclServiceService } from './acl-service.service';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'app-admin-acl-management',
  templateUrl: './admin-acl-management.component.html',
  styleUrls: ['./admin-acl-management.component.css']
})
export class AdminAclManagementComponent implements OnInit {

  //component properties
  users: any = [];
  filterName:string='';
  displayArray = [];
  length:number;
  pageSize:number = 10;
  filteredArray:any = [];

  pageEvent: PageEvent

  pageEventHandler(pageEvent:PageEvent){
    console.log(pageEvent);
      let i = pageEvent.pageIndex * this.pageSize;
      let endSlice = i + this.pageSize
      if (endSlice > this.filteredArray.length){
        endSlice = this.filteredArray.length;
      }
      console.log( 'index start ', i, ' endSlice ', endSlice);
      this.displayArray = [];
      this.displayArray = this.filteredArray.slice(i, endSlice)
    
  }

  constructor(private adminService:AdminService, private aclService: AclServiceService) { }

  filterUsers(filterName){
    if(filterName == null || filterName == undefined || filterName.length == 0){
      this.filteredArray = this.users;
      this.length = this.filteredArray.length; 
      this.displayArray = this.filteredArray.slice(0, 10);
    }else{
      this.filteredArray = [];
      this.users.forEach(element => {
        if (element.displayName.toLowerCase().indexOf(filterName)>-1){
          this.filteredArray.push(element);
        }
      });
      this.length = this.filteredArray.length;
      this.displayArray = this.filteredArray.slice(0,10);
      
    }
  }

  ngOnInit() {
    this.adminService.getUsersAcls().subscribe(
      (res)=>{
        //assign return to local property
        this.users = res;
        this.users.forEach(element => {
          element = this.aclService.removeUnwantedProps(element);
        })
        this.filterUsers('');
      },
    (err)=>{ console.log(err);}
    )
  }
}
