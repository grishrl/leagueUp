import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from 'src/app/services/admin.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { DeleteConfrimModalComponent } from '../../../modal/delete-confrim-modal/delete-confrim-modal.component';
import { Color } from '@angular-material-components/color-picker';

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
  disabled = false;

  markFormGroupTouched(formGroup: FormGroup) {

    if (formGroup.controls) {
      const keys = Object.keys(formGroup.controls);
      for (let i = 0; i < keys.length; i++) {
        const control = formGroup.controls[keys[i]];

        if (control instanceof FormControl) {
          control.markAsTouched();
        } else if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    }
  }

  constructor(private dialog: MatDialog, private adminService: AdminService) { }

  displayNameControl = new FormControl('', [
    Validators.required
  ]);

  colorCtr = new FormControl('', [
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
  divisionModeratorControl = new FormControl('', [
    Validators.required
  ]);

  sortingControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/[0-9]/gm)
  ])

  divisionForm = new FormGroup({
    displayName: this.displayNameControl,
    divName: this.divisionNameControl,
    maxMMR: this.maxMMRControl,
    minMMR: this.minMMRControl,
    sorting: this.sortingControl,
    divisionModerator: this.divisionModeratorControl,
    divColor: this.colorCtr
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
    this.markFormGroupTouched(this.divisionForm)
    this.editDivision = Object.assign({}, div);
    this.safeSource = Object.assign({},div);

    //set the division color selector
    if(this.editDivision.divColor){
      let color = this.hexToRgb(this.editDivision.divColor);
      let z = new Color(color.r, color.g, color.b);
      this.colorCtr.setValue(z.toString('rgb'));
      this.deColore = z;
    }
  }

  //sets up an empty object to create a new division from
  createNew(){
    this.markFormGroupTouched(this.divisionForm)
    this.newDiv = true;
    this.editDivision = Object.assign({});
  }

  selectorRefresh = 1;

  ngOnInit() {

  }

  color;

  deColore;

  updateColor(e){
    if(e && e.hex){
      this.editDivision.divColor = e.hex;
    }

  }

  private hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
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
          this.selectorRefresh+=1;
          this.ngOnInit();
          window.scroll(0,0);
        },err=>{
          alert('Division not created');
        }
      )
    }else{
      this.adminService.saveDivisionEdits(this.safeSource.divisionConcat, this.editDivision).subscribe(
        res => {
          this.editDivision = null;
          this.selectorRefresh+=1;
          this.ngOnInit();
          window.scroll(0,0);
        }, err => {
          console.warn(err)
        }
      )
    }
  }

}
