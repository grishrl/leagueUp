import { Component, OnInit } from '@angular/core';
import { MvpService } from '../services/mvp.service';

@Component({
  selector: "app-mvp-page",
  templateUrl: "./mvp-page.component.html",
  styleUrls: ["./mvp-page.component.css"]
})
export class MvpPageComponent implements OnInit {
  constructor(private mvpService: MvpService) {}

  mvpList = [];
  ngOnInit(): void {
    this.mvpService.getAll().subscribe(res => {
      this.mvpList = res;
    });
  }
}
