import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AdminService } from 'src/app/services/admin.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { DialogOverviewExampleDialog } from '../../../profile-edit/profile-edit.component';

@Component({
  selector: 'app-division-props',
  templateUrl: './division-props.component.html',
  styleUrls: ['./division-props.component.css']
})
export class DivisionPropsComponent implements OnInit {

  constructor(private dialog: MatDialog, private adminService: AdminService) { }

  displayNameControl = new FormControl('', [
    Validators.required
  ]);
  divisionNameControl = new FormControl('', [
    Validators.required
  ]);
  divisionCoastControl = new FormControl('', [
    Validators.required
  ]);
  maxMMRControl = new FormControl('', [
    Validators.required
  ]);
  minMMRControl = new FormControl('', [
    Validators.required
  ]);

  divisionForm = new FormGroup({
    displayName: this.displayNameControl,
    divName: this.divisionNameControl,
    maxMMR: this.maxMMRControl,
    minMMR: this.minMMRControl
  })

  newDiv:boolean=false;
  divisions:any=[];
  selectedDivision:any=null;
  safeSource
  editDivision

  calculateNewConcat(){
    console.log('this.editDivision.divisionName ', this.editDivision.divisionName, ' this.editDivision.divisionCoast ', this.editDivision.divisionCoast )
    let div = this.editDivision.divisionName?this.editDivision.divisionName.toLowerCase():'' 
    
    let coast = this.editDivision.divisionCoast?this.editDivision.divisionCoast.toLowerCase():'';
    
    this.editDivision.divisionConcat = div
    if (coast.length>0){
      this.editDivision.divisionConcat=this.editDivision.divisionConcat+'-'+coast;
    }
    this.editDivision.divisionConcat = this.editDivision.divisionConcat.replace(/[^A-Z0-9\-]+/ig, "-");
  }

  selected(div){
    this.editDivision = Object.assign({}, this.selectedDivision);
    this.safeSource = Object.assign({},this.selectedDivision);
  }

  createNew(){
    this.newDiv = true;
    this.editDivision = Object.assign({});
  }

  ngOnInit() {
    this.adminService.getDivisionList().subscribe( (res)=>{
      this.divisions = res;
    }, (err)=> {
      console.log(err);
    })
  }

  revert(){
    if(this.newDiv){
      this.editDivision = null;  
    }
    this.editDivision = Object.assign({}, this.safeSource);
  }

  confirm: string
  delete(divConcat): void {

    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '300px',
      data: { confirm: this.confirm }
    });

    dialogRef.afterClosed().subscribe(result => {


      if (result.toLowerCase() == 'delete') {
        this.adminService.deleteDivision(divConcat).subscribe(
          res=>{
            this.editDivision=null;
            this.ngOnInit();
          },
          err=>{
            alert('Division was not deleted!')
          }
        )
      }
    });
  }

  save(){
    if(this.newDiv){
      console.log(this.editDivision);
      this.adminService.createDivision(this.editDivision).subscribe(
        res=>{
          this.newDiv = false;
          this.editDivision = null;
          this.ngOnInit();
        },err=>{
          alert('Division not created');
        }
      )
    }else{
      this.adminService.saveDivisionEdits(this.safeSource.divisionConcat, this.editDivision).subscribe(
        res => {
          this.editDivision = null;
          this.ngOnInit();
          console.log(res);
        }, err => {
          console.log(err)
        }
      )
    }
  }

}
