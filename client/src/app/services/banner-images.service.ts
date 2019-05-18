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
    console.log(ind, url);
    return url;


  }

  images = [
    "DN.jpg",
    "En.jpg",
    "FKC.jpg",
    "Gy.jpg",
    "Ip.jpg",
    "Kt.jpg",
    "Ml.jpg",
    "Mp.jpg"
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
