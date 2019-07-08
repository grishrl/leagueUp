import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-ngs-accordian',
  templateUrl: './ngs-accordian.component.html',
  styleUrls: ['./ngs-accordian.component.css'],
  encapsulation: ViewEncapsulation.Native
})
export class NgsAccordianComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  noShow = "none";
  toggleOpen(){
    if(this.noShow == "none"){
      this.noShow='';
    }else{
      this.noShow = "none";
    }
  }
}
