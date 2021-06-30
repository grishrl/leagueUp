import { Component, OnInit } from '@angular/core';
import { DivisionService } from '../services/division.service';

@Component({
  selector: 'app-footer',
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.css']
})
export class AppFooterComponent implements OnInit {

  constructor(private divisionService: DivisionService) { }

  divisions = [];
  year;
  ngOnInit() {
    let n = Date.now();
    let nD = new Date(n);
    this.year = nD.getFullYear();
    //get divisions for the division list drop down
    this.divisionService.getDivisionInfo().subscribe(res => {
      this.divisions = res;
    }, err => {
      console.warn(err);
    });
  }

}
