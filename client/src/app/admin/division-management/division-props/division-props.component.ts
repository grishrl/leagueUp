import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AdminService } from 'src/app/services/admin.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { DeleteConfrimModalComponent } from '../../../modal/delete-confrim-modal/delete-confrim-modal.component';

@Component({
  selector: 'app-division-props',
  templateUrl: './division-props.component.html',
  styleUrls: ['./division-props.component.css']
})
export class DivisionPropsComponent implements OnInit {

  //component properties
  newDiv: boolean = false;
  divisions: any = [];
  selectedDivision: any = null;
  safeSource
  editDivision

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

  //creates a new concatinated system id from provided inputs
  calculateNewConcat(){
    let div = this.editDivision.divisionName?this.editDivision.divisionName.toLowerCase():'' 
    
    let coast = this.editDivision.divisionCoast?this.editDivision.divisionCoast.toLowerCase():'';
    
    this.editDivision.divisionConcat = div
    if (coast.length>0){
      this.editDivision.divisionConcat=this.editDivision.divisionConcat+'-'+coast;
    }
    this.editDivision.divisionConcat = this.editDivision.divisionConcat.replace(/[^A-Z0-9\-]+/ig, "-");
  }

  //division selected from dropdown, creates a safe source to cancel back to
  selected(div){
    this.editDivision = Object.assign({}, this.selectedDivision);
    this.safeSource = Object.assign({},this.selectedDivision);
  }

  //sets up an empty object to create a new division from
  createNew(){
    this.newDiv = true;
    this.editDivision = Object.assign({});
  }

  ngOnInit() {
    //gets division list
    this.adminService.getDivisionList().subscribe( (res)=>{
      this.divisions = res;
    }, (err)=> {
      console.log(err);
    })
  }

  //reverts any changes to a dib object back to the safe source created at selection
  revert(){
    if(this.newDiv){
      this.editDivision = null;  
    }
    this.editDivision = Object.assign({}, this.safeSource);
  }

  //opens a modal to receive confirmation to delete
  confirm: string
  delete(divConcat): void {

    const dialogRef = this.dialog.open(DeleteConfrimModalComponent, {
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

  //handles the saving of edits to a division or the creation of a new division
  //resets the view on success
  save(){
    if(this.newDiv){
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
        }, err => {
          console.log(err)
        }
      )
    }
  }

}
