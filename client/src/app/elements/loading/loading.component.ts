import { Component, OnInit, Input } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {

  constructor(private util:UtilitiesService) { }

  ngOnInit(): void {
  }

  showLoadingVal:boolean = true;

  @Input() set showLoading(val){
    if(this.util.isNullOrEmpty(val)){
      this.showLoadingVal = true;
    }else{
      this.showLoadingVal = val;
    }
  }

  @Input() displayText = 'Loading'

}
