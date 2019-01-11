import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-no-access',
  templateUrl: './no-access.component.html',
  styleUrls: ['./no-access.component.css']
})
export class NoAccessComponent implements OnInit {

  role:string = '';
  constructor(private router: ActivatedRoute) {
    this.role = this.router.snapshot.params['id'];
    this.role = this.role.toUpperCase();
   }


  ngOnInit() {
  }

}
