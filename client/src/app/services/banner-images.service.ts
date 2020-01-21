import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BannerImagesService {

  constructor() { }

  lastInd;

  returnImage(){

    let ind = this.uniqueNumGen();
    let imageName = this.images[ind];
    let url = 'https://s3.amazonaws.com/' + environment.s3bucketGeneralImage + '/' + imageName;
    return url;


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
    "Pb.jpg"
  ]

  uniqueNumGen(val?){
    if(val==null||val==undefined){
      return this.uniqueNumGen(Math.floor(Math.random() * Math.floor(this.images.length)));
    }else{
      if(val == this.lastInd){
        return this.uniqueNumGen(Math.floor(Math.random() * Math.floor(this.images.length)));
      }else{
        this.lastInd = val;
        return this.lastInd;
      }
    }
    }
}
