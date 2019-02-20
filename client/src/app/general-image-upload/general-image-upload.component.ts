import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgxCroppieComponent } from 'ngx-croppie';
import { CroppieOptions } from 'croppie';
import { UtilitiesService } from '../services/utilities.service';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-general-image-upload',
  templateUrl: './general-image-upload.component.html',
  styleUrls: ['./general-image-upload.component.css']
})
export class GeneralImageUploadComponent implements OnInit {


  @ViewChild('ngxCroppie') ngxCroppie: NgxCroppieComponent;

  _objectId: string
  @Input() set objectId(id) {
    if (!this.util.isNullOrEmpty(id)) {
      this._objectId = id;
    } else {
      this._objectId = '';
    }
  }

  _objectType:string
  @Input() set objectType(type) {
    if (!this.util.isNullOrEmpty(type)) {
      this._objectType = type;
    } else {
      this._objectType = '';
    }
  }

  _showEdit: boolean = false;
  @Input() set showEdit(show) {
    if (show != null && show != undefined) {
      this._showEdit = show;
    } else {
      this._showEdit = false;
    }
  }

  @Input() set existingImage(img) {
    console.log('input')
    if (img != null && img != undefined && img.length) {
      console.log('img ', img)
      this.currentImage = this.util.generalImageFQDN(img);
      console.log('this.currentImage ', this.currentImage);
    } else {
      this.currentImage = null;
    }
  }

  widthPx;
  heightPx;

  @Input() set width(w){
    if(this.util.isNullOrEmpty(w)){
      this.widthPx = '350';
    }else{
      this.widthPx = w;
    }
  }

  @Input() set height(h){
    if(this.util.isNullOrEmpty(h)){
      this.heightPx= '230';
    }else{
      this.heightPx = h;
    }
  }

  editClicked: boolean = true;

  
  
  imageUrl = '';
  currentImage: string;
  croppieImage: string;

  constructor( private admin:AdminService, private util: UtilitiesService) {

  }

  public get imageToDisplay() {
    let imgRet;
    
    if (this.currentImage) { imgRet = this.currentImage; }
    else if (this.imageUrl) { imgRet = this.imageUrl; } else {
      imgRet = `https://placehold.it/${this.widthPx}x${this.heightPx}`;
    }
    
    return imgRet
  }

  public get croppieOptions(): CroppieOptions {
    const opts: CroppieOptions = {};
    opts.viewport = {
      width: parseInt(this.widthPx, 10),
      height: parseInt(this.heightPx, 10)
    };
    opts.boundary = {
      width: parseInt(this.widthPx, 10) * 1.1,
      height: parseInt(this.heightPx, 10) * 1.1
    };
    opts.enforceBoundary = false;
    return opts;
  }

  public get croppieImageG(): string {
    return this.croppieImage;
  }

  ngOnInit() {
    console.log('oninit')
    if (this.util.isNullOrEmpty(this.currentImage)){
      this.currentImage = this.imageUrl;
    }
  
    this.croppieImage = this.imageUrl;
  }

  ngOnChanges(changes: any) {
    if (this.croppieImage) { return; }
    if (!changes.imageUrl) { return; }
    if (!changes.imageUrl.previousValue && changes.imageUrl.currentValue) {
      this.croppieImage = changes.imageUrl.currentValue;
    }
  }

  newImageResultFromCroppie(img: string) {
    this.croppieImage = img;
  }

  saveImageFromCroppie() {

    let input = {
      image: this.croppieImage,
      id: this._objectId,
      type:this._objectType
    }

    this.admin.imageUpload(input).subscribe(res => {
      this.currentImage = this.croppieImage;
      this.croppieImage = null;
      this.editClicked = true;
    }, (err) => {
      console.log(err);
    });

  }

  cancelCroppieEdit() {
    this.croppieImage = null;
    this.editClicked = true;
  }

  imageUploadEvent(evt: any) {
    this.croppieImage = null;
    if (!evt.target) { return; }
    if (!evt.target.files) { return; }
    if (evt.target.files.length !== 1) { return; }
    const file = evt.target.files[0];
    if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif' && file.type !== 'image/jpg') { return; }
    const fr = new FileReader();
    fr.onloadend = (loadEvent) => {
      this.croppieImage = '';
      this.croppieImage = <string>fr.result;
    };
    fr.readAsDataURL(file);
  }


}
