import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-division-props',
  templateUrl: './division-props.component.html',
  styleUrls: ['./division-props.component.css']
})
export class DivisionPropsComponent implements OnInit {

  constructor(private adminService: AdminService) { }

  divisions:any=[];
  selectedDivision:any=null;
  safeSource
  editDivision

  calculateNewConcat(){
    
    this.editDivision.divisionConcat = this.editDivision.divisionName.toLowerCase() + '-' + this.editDivision.divisionCoast.toLowerCase();
  }

  selected(div){
    this.editDivision = Object.assign({}, this.selectedDivision);
    this.safeSource = Object.assign({},this.selectedDivision);
  }

  ngOnInit() {
    this.adminService.getDivisionList().subscribe( (res)=>{
      this.divisions = res;
    }, (err)=> {
      console.log(err);
    })
  }

  revert(){
    this.editDivision = Object.assign({}, this.safeSource);
  }

  save(){
    this.adminService.saveDivisionEdits(this.safeSource.divisionConcat, this.editDivision).subscribe(
      res=>{
        console.log(res);
      },err=>{
        console.log(err)
      }
    )
  }

}
