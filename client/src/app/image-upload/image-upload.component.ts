import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { CroppieOptions } from 'croppie';
import { NgxCroppieComponent } from 'ngx-croppie';
import { TeamService } from '../services/team.service';
import { UtilitiesService } from '../services/utilities.service';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent implements OnInit {
  @ViewChild('ngxCroppie', { static: false }) ngxCroppie: NgxCroppieComponent;

  _teamName: string
  @Input() set teamName(name) {
    if (name != null && name != undefined && name.length) {
      this._teamName = name;
    } else {
      this._teamName = '';
    }
  }

  _embedded:boolean=false;
  @Input() set embedded(embedded){
    if(!this.util.isNullOrEmpty(embedded)){
      this._embedded = embedded;
    }
  }

  _showEdit:boolean=false;
  @Input() set showEdit(show){
    if (show != null && show != undefined) {
      this._showEdit = show;
    } else {
      this._showEdit = false;
    }
  }

  @Input() set teamLogo(img){
    if (img != null && img != undefined && img.length) {
      this.currentImage = this.teamService.imageFQDN(encodeURIComponent(img));
    } else {
      this.currentImage = null;
    }
  }

  editClicked:boolean=true;

  widthPx = '500';
  heightPx = '350';
  imageUrl = '';
  currentImage: string;
  croppieImage: string;
  editedImage:string;

  constructor(private teamService:TeamService, private util:UtilitiesService, private admin:AdminService){

  }

  removeImage(){
    this.admin.teamRemoveLogo(this._teamName).subscribe(
      res=>{
        this.currentImage = `https://placehold.it/${this.widthPx}x${this.heightPx}`;
      },
      err=>{
        console.log(err);
      }

    )
  }

  public get imageToDisplay() {
    let imgRet;
    if (this.currentImage) { imgRet = this.currentImage; }
    else if (this.imageUrl) { imgRet = this.imageUrl; }else{
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
      width: parseInt(this.widthPx, 10)*1.1,
      height: parseInt(this.heightPx, 10)*1.1
    };
    opts.enforceBoundary = false;
    return opts;
  }

  // public get croppieImageG():string{
  //   return this.croppieImage;
  // }

  ngOnInit() {
    // this.currentImage = this.imageUrl;
    // this.croppieImage = this.imageUrl;
  }

  ngOnChanges(changes: any) {
    if (this.croppieImage) { return; }
    if (!changes.imageUrl) { return; }
    if (!changes.imageUrl.previousValue && changes.imageUrl.currentValue) {
      this.croppieImage = changes.imageUrl.currentValue;
    }
  }

  newImageResultFromCroppie(img: string) {
    this.editedImage = img;
  }

  saveImageFromCroppie() {

    let input = {
      logo: this.editedImage,
      teamName: this._teamName
    }

    if(this._embedded){
      this.admin.teamLogoUpload(input).subscribe(res=>{
        this.currentImage = this.editedImage;
        this.croppieImage = null;
        this.editClicked = true;
      },
      (err)=>{
        console.log(err)
      })
    }else{
      this.teamService.logoUpload(input).subscribe(res => {
        this.currentImage = this.editedImage;
        this.croppieImage = null;
        this.editClicked = true;
      }, (err) => {
        console.log(err);
      });
    }


  }

  cancelCroppieEdit() {
    this.croppieImage = null;
    this.editedImage = null;
    this.editClicked = true;
  }

  imageUploadEvent(evt: any) {
    this.croppieImage=null;
    if (!evt.target) { return; }
    if (!evt.target.files) { return; }
    if (evt.target.files.length !== 1) { return; }
    const file = evt.target.files[0];
    if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif' && file.type !== 'image/jpg') { return; }
    const fr = new FileReader();
    this.util.imageToPng(file).then(
      ret => {
        fr.readAsDataURL(ret);
      },
      err => {
        console.log(err);
      }
    );
    fr.onloadend = (loadEvent) => {

      this.croppieImage = '';
      this.croppieImage = <string>fr.result;
    };


  }

}
