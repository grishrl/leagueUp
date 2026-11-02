import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { AclService } from './acl.service';
import { PageEvent, MatPaginator } from '@angular/material/paginator'
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-admin-acl-management',
  templateUrl: './admin-acl-management.component.html',
  styleUrls: ['./admin-acl-management.component.css']
})
export class AdminAclManagementComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  //component properties
  users: any = [];
  filterName:string='';
  showElevatedOnly:boolean = false;
  selectedPermissions: string[] = [];
  displayArray = [];
  length:number;
  pageSize:number = 10;
  filteredArray:any = [];

  pageEvent: PageEvent

  pageEventHandler(pageEvent:PageEvent){
      let i = pageEvent.pageIndex * this.pageSize;
      let endSlice = i + this.pageSize
      if (endSlice > this.filteredArray.length){
        endSlice = this.filteredArray.length;
      }
      this.displayArray = [];
      this.displayArray = this.filteredArray.slice(i, endSlice)

  }

  ngAfterViewInit() {
    this.paginator.pageIndex = 0;
  }

  constructor(private adminService:AdminService, public aclService: AclService, private util: UtilitiesService) { }

  filterUsers(filterName: string){
    const normalizedFilterName = (filterName || '').toLowerCase();
    this.filteredArray = this.users.filter(user => {
      const matchesName = !normalizedFilterName ||
        (!this.util.isNullOrEmpty(user.displayName) &&
          user.displayName.toLowerCase().indexOf(normalizedFilterName) > -1);
      const hasElevatedPrivileges = user.adminRights &&
        Object.keys(user.adminRights).some(key => user.adminRights[key] === true);
      const matchesSelectedPermissions = this.selectedPermissions.length === 0 ||
        this.selectedPermissions.some(permission => user.adminRights && user.adminRights[permission] === true);

      return matchesName &&
        (!this.showElevatedOnly || hasElevatedPrivileges) &&
        matchesSelectedPermissions;
    });

    this.length = this.filteredArray.length;
    this.displayArray = this.filteredArray.slice(0, 10);
    this.paginator.firstPage();
  }

  toggleElevatedPrivileges(){
    this.filterUsers(this.filterName);
  }

  togglePermission(permission: string, selected: boolean){
    if (selected) {
      this.selectedPermissions.push(permission);
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(selectedPermission => selectedPermission !== permission);
    }
    this.filterUsers(this.filterName);
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
    (err)=>{ console.warn(err);}
    )
  }
}
