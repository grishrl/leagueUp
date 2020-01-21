import { Component, OnInit, Input } from '@angular/core';
import { WordpressService } from 'src/app/services/wordpress.service';

@Component({
  selector: 'app-image-getter',
  templateUrl: './image-getter.component.html',
  styleUrls: ['./image-getter.component.css']
})
export class ImageGetterComponent implements OnInit {

  constructor(private WP:WordpressService) { }

  @Input() imgId;
  imageUrl

  @Input() class;

  ngOnInit() {
    if(this.imgId){
      this.WP.getCacheImage(this.imgId).subscribe(
        res => {
          this.imageUrl = res;
        }
      );
    }

  }

}
