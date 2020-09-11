import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: "root",
})
export class BannerImagesService {
  constructor() {}

  lastInd;

  private url = `https://s3.amazonaws.com/${environment.s3bucketGeneralImage}/`;
  returnImage() {
    let ind = this.uniqueNumGen();
    let imageName = this.images[ind];
    return this.url + imageName;
  }

  returnSpecialImage(para) {
    if (para.toLowerCase().includes("mongoose")) {
      return this.url + "DG_banner_image.jpg";
    }
  }

  images = [
    "Aba.jpg",
    "Ad.jpg",
    "Dh.jpg",
    "Dic.jpg",
    "DN.jpg",
    "Dw.jpg",
    "En.jpg",
    "Fc.jpg",
    "FKC.jpg",
    "Gy.jpg",
    "Ha.jpg",
    "Hs.jpg",
    "Ip.jpg",
    "Ker.jpg",
    "Kt.jpg",
    "Mal.jpg",
    "Me.jpg",
    "Ml.jpg",
    "Mp.jpg",
    "Pb.jpg",
    "nexomania_II_banner_image.jpg",
    "mei_banner_image.jpg",
    "Ice_Crown_Citadel.png",
    "Arthas_v_Artanis.png",
  ];

  uniqueNumGen(val?) {
    if (val == null || val == undefined) {
      return this.uniqueNumGen(
        Math.floor(Math.random() * Math.floor(this.images.length))
      );
    } else {
      if (val == this.lastInd) {
        return this.uniqueNumGen(
          Math.floor(Math.random() * Math.floor(this.images.length))
        );
      } else {
        this.lastInd = val;
        return this.lastInd;
      }
    }
  }
}
