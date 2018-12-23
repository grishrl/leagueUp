import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { CroppieOptions } from 'croppie';
import { NgxCroppieComponent } from 'ngx-croppie';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent implements OnInit {
  @ViewChild('ngxCroppie') ngxCroppie: NgxCroppieComponent;

  _teamName: string
  @Input() set teamName(name) {
    if (name != null && name != undefined && name.length) {
      this._teamName = name;
    } else {
      this._teamName = '';
    }
  }
  _showEdit:boolean=false;
  @Input() set showEdit(show){
    console.log(show)
    if (show != null && show != undefined) {
      this._showEdit = show;
    } else {
      this._showEdit = false;
    }
  }

  @Input() set teamLogo(img){
    if (img != null && img != undefined && img.length) {
      this.currentImage = img;
    } else {
      this.currentImage = null;
    }
  }

  editClicked:boolean=true;

  widthPx = '350';
  heightPx = '230';
  imageUrl = '';
  currentImage: string;
  croppieImage: string;

  constructor(private http: HttpClient){

  }

  public get imageToDisplay() {
    if (this.currentImage) { return this.currentImage; }
    if (this.imageUrl) { return this.imageUrl; }
    return `http://placehold.it/${this.widthPx}x${this.heightPx}`;
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

  public get croppieImageG():string{
    return this.croppieImage;
  }

  ngOnInit() {
    this.currentImage = this.imageUrl;
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
    // let url = 'http://localhost:3000/team/uploadLogo';
    let url = 'team/uploadLogo';
    
    let input = {
      logo: this.croppieImage,
      teamName: this._teamName
    }

    this.http.post(url, input).subscribe(res=>{
      this.currentImage = this.croppieImage;
      this.croppieImage = null;
      this.editClicked = true;
    }, err=>{
    })
   
  }

  cancelCroppieEdit() {
    this.croppieImage = null;
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
    fr.onloadend = (loadEvent) => {
      this.croppieImage = '';
      this.croppieImage = <string>fr.result;
    };
    fr.readAsDataURL(file);
  }

}
