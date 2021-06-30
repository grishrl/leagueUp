import { Component, OnInit, Input, SimpleChange, Output, EventEmitter, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { TeamService } from '../services/team.service';
import { UtilitiesService } from '../services/utilities.service';
import { AdminService } from '../services/admin.service';
import { UserService } from '../services/user.service';

@Component({
  selector: "app-image-upload",
  templateUrl: "./image-upload.component.html",
  styleUrls: ["./image-upload.component.css"]
})
export class ImageUploadComponent implements OnInit {
  randomName;
  _teamName: string;
  @Input() set teamName(name) {
    if (name != null && name != undefined && name.length) {
      this._teamName = name;
    } else {
      this._teamName = "";
    }
  }

  _imageType: string;
  @Input() set imageType(id) {
    if (!this.util.isNullOrEmpty(id)) {
      this._imageType = id;
    } else {
      console.warn("Invalid Image Type Provided to app-image-upload");
    }
  }

  @ViewChild('parent') div:ElementRef

  ngOnChanges(change: SimpleChange) {
    if (this._imageType == "teamlogo") {
      this.currentImage = this.teamService.imageFQDN(
        encodeURIComponent(this._existingImage)
      );
    } else if (this._imageType == "event") {
      this.currentImage = this.util.generalImageFQDN(this._existingImage);
    } else if (this._imageType == "avatar") {
      this.currentImage = this.user.avatarFQDN(this._existingImage);
    }
  }

  _playerName: string;
  @Input() set playerName(name) {
    if (name != null && name != undefined && name.length) {
      this._playerName = name;
    } else {
      this._playerName = "";
    }
  }

  _embedded: boolean = false;
  @Input() set embedded(embedded) {
    if (!this.util.isNullOrEmpty(embedded)) {
      this._embedded = embedded;
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

  _objectType: string;
  @Input() set objectType(type) {
    if (!this.util.isNullOrEmpty(type)) {
      this._objectType = type;
    } else {
      this._objectType = "";
    }
  }

  _objectId: string;
  @Input() set objectId(id) {
    if (!this.util.isNullOrEmpty(id)) {
      this._objectId = id;
    } else {
      this._objectId = "";
    }
  }

  _existingImage;
  @Input() set existingImage(img) {
    if (img != null && img != undefined && img.length) {
      this._existingImage = img;
    } else {
      this._existingImage = null;
    }
  }

  widthPx;
  heightPx;

  @Output() imageParsed = new EventEmitter();

  @Input() set width(w) {
    if (this.util.isNullOrEmpty(w)) {
      this.widthPx = "350";
    } else {
      this.widthPx = w;
    }
  }

  @Input() set height(h) {
    if (this.util.isNullOrEmpty(h)) {
      this.heightPx = "230";
    } else {
      this.heightPx = h;
    }
  }

  editClicked: boolean = true;

  imageUrl = "";
  currentImage: string;
  croppieImage: string;
  editedImage: string;
  croppieHidden = true;

  constructor(
    private renderer:Renderer2,
    private user: UserService,
    private teamService: TeamService,
    private util: UtilitiesService,
    private admin: AdminService
  ) {
    this.randomName = Math.floor(Math.random() * Math.floor(1000));
  }

  removeImage() {
    this.admin.teamRemoveLogo(this._teamName).subscribe(
      res => {
        this.currentImage = `https://placehold.it/${this.widthPx}x${this.heightPx}`;
      },
      err => {
        console.log(err);
      }
    );
  }

  public get imageToDisplay() {
    let imgRet;
    if (this.currentImage) {
      imgRet = this.currentImage;
    } else if (this.imageUrl) {
      imgRet = this.imageUrl;
    } else {
      imgRet = `https://placehold.it/${this.widthPx}x${this.heightPx}`;
    }
    return imgRet;
  }

  imageHeader;
  actionText;
  ngOnInit() {
    if(!this.widthPx){
      this.widthPx = "350";
    }
    if (!this.heightPx) {
      this.heightPx = "230";
    }
    if (this._imageType == "teamlogo") {
      this.imageHeader = "Team Logo:";
      this.actionText = "Upload New Team Logo:";
    } else if (this._imageType == "event") {
      this.imageHeader = " Current Image:";
      this.actionText = "Upload New Image:";
    } else if (this._imageType == "avatar") {
      this.imageHeader = "Avatar Image:";
      this.actionText = "Upload New Avatar:";
    }else if (this._imageType == "stormVerification") {
      this.imageHeader = "Verification Image:";
      this.actionText = "Upload New Image:";
    }
  }

  actionEdit(){
    this.editClicked = !this.editClicked;
  }

  croppieObject;
  ngAfterViewInit() {

    let parentContainerWidth = this.div.nativeElement.clientWidth;
    let totalCroppieWidth = Math.ceil(.9*parentContainerWidth);
    let totalCroppeHeight = Math.ceil((totalCroppieWidth/16)*9);

    console.log(parentContainerWidth, totalCroppieWidth, totalCroppeHeight)

    let wB = totalCroppieWidth*1.2;
    let hB = totalCroppeHeight*1.2;
    let ele = `#${this.randomName}`;
    this.croppieObject = $(ele).croppie({
      viewport: {
        width: Math.ceil(totalCroppieWidth*.8),
        height: Math.ceil(totalCroppeHeight*.8),
        type:'square'
      },
      boundary: {
        width: totalCroppieWidth,
        height: totalCroppeHeight
      },
      enforceBoundary:false
    });
  }

  saveImageFromCroppie() {
    this.croppieObject
      .croppie("result", {
        type: "base64",
        size: {height:this.heightPx, width:this.widthPx},
        format: "png",
        quality: 0.8
      })
      .then(
        result => {
          if (this._imageType == "teamlogo") {
            let input = {
              logo: result,
              teamName: this._teamName
            };
            if (this._embedded) {
              this.admin.teamLogoUpload(input).subscribe(
                res => {
                  this.currentImage = result;
                  this.croppieImage = null;
                  this.editClicked = true;
                },
                err => {
                  console.log(err);
                }
              );
            } else {
              this.teamService.logoUpload(input).subscribe(
                res => {
                  this.currentImage = result;
                  this.croppieImage = null;
                  this.editClicked = true;
                },
                err => {
                  console.log(err);
                }
              );
            }
          } else if (this._imageType == "event") {
            let input = {
              image: result,
              id: this._objectId,
              type: this._objectType
            };

            this.admin.imageUpload(input).subscribe(
              res => {
                this.currentImage = result;
                this.croppieImage = null;
                this.editClicked = true;
              },
              err => {
                console.log(err);
              }
            );
          } else if (this._imageType == "avatar") {
            let input = {
              logo: result,
              displayName: this._playerName
            };

            this.user.avatarUpload(input).subscribe(
              res => {
                this.currentImage = result;
                this.croppieImage = null;
                this.editClicked = true;
              },
              err => {
                console.log(err);
              }
            );
          }else if(this._imageType == "stormVerification"){
            //do a kick flip!
            //this is unheard of but... i want this image string outside of this component.
            this.currentImage = result;
            this.croppieImage = null;
            this.editClicked = true;
            this.imageParsed.emit(result);
          }
        },
        err => {
          console.error(err);
        }
      );
  }

  cancelCroppieEdit() {
    this.croppieImage = null;
    this.editedImage = null;
    this.editClicked = true;
    this.croppieHidden = true;
  }

  imageUploadEvent(evt: any) {
    this.croppieImage = null;
    if (!evt.target) {
      return;
    }
    if (!evt.target.files) {
      return;
    }
    if (evt.target.files.length !== 1) {
      return;
    }
    const file = evt.target.files[0];
    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png" &&
      file.type !== "image/gif" &&
      file.type !== "image/jpg"
    ) {
      return;
    }
    const fr = new FileReader();
    fr.onloadend = loadEvent => {
      this.croppieImage = "";
      this.croppieHidden = false;
      this.croppieObject.croppie("bind", { url: fr.result }).then(res => {

      });
    };
    fr.readAsDataURL(file);
  }
}
