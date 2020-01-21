import { Component, OnInit, Input } from '@angular/core';
import { BannerImagesService } from '../services/banner-images.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-banner-image',
  templateUrl: './banner-image.component.html',
  styleUrls: ['./banner-image.component.css']
})
export class BannerImageComponent implements OnInit {

  constructor(private BannerImage: BannerImagesService) { }

  imgSrc;
  title = 'Default Title';
  @Input() set bannerTitle(val){
    if(val){
      this.title = val;
    }
  }

  breadCrumb = false;

  providedRoot;
  @Input() set bannerCrumbRoot(val) {
    if (val) {
      this.providedRoot = val;
    }
  }

  additionalClasses
  @Input() set bannerAdditionalClasses(val){
    if(val){
      this.additionalClasses = val;
    }
  }

  providedBranch;
  @Input() set bannerCrumbBranch(val) {
    if (val) {
      this.providedBranch = val;
    }
  }

  providedLink;
  @Input() set bannerCrumbLink(val) {
    if (val) {
      this.providedLink = val;
    }

  }

  ngOnInit() {
    if(this.providedBranch && this.providedLink && this.providedRoot){
      this.breadCrumb = true;
    }

    this.imgSrc = this.BannerImage.returnImage();
  }

}
