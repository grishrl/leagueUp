import { Component, OnInit, Input, SimpleChange, Output, EventEmitter, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { TeamService } from '../../services/team.service';
import { UtilitiesService } from '../../services/utilities.service';
import { AdminService } from '../../services/admin.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: "app-image-upload",
  templateUrl: "./image-upload.component.html",
  styleUrls: ["./image-upload.component.css"]
})
export class ImageUploadComponent implements OnInit {
  randomName;
  _teamName: string;

  styleW;
  styleH;

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
        this.currentImage = `https://via.placeholder.com/${this.widthPx}x${this.heightPx}`;
      },
      err => {
        console.warn(err);
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
      imgRet = `https://via.placeholder.com/${this.widthPx}x${this.heightPx}`;
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

    //buckle up for some black magic...
    //in order to keep the croppie from overflowing the parent element and trashing the page we have
    //to do some dark magics... but doing those magics come at a cost...

    let ele = `#${this.randomName}`;

    //get the width of the croppies parent element..
    let parentContainerWidth = this.div.nativeElement.clientWidth;

    //we will use 90% of the parents width to give out croppie some room
    let totalCroppieWidth = Math.floor(.9*parentContainerWidth);

    //because this componenet allows custom W:H we need to make sure we always are calculating the proper ratio for
    //the croppie / output or else we get squishy images
    let totalCroppeHeight = defaultRatioCalculation(this.widthPx, this.heightPx, totalCroppieWidth);

    // attach the W:H to the div containing croppie
    this.styleH = totalCroppeHeight;
    this.styleW = totalCroppieWidth;

    let boundryWitdh, boundryHeight, viewportWidth, viewportHeight;

    // IF the width provided to the component + 20% is less than containing div width then we shall use the
    // component provided W:H  otherwise; the provided W:H will cause an overflow of the div and we need to scale it accordingly
    if(totalCroppieWidth < (this.widthPx*1.2)){
      boundryHeight = totalCroppeHeight;
      boundryWitdh = totalCroppieWidth;
      viewportHeight = Math.floor(totalCroppeHeight*.8);
      viewportWidth = Math.floor(totalCroppieWidth*.8);
    }else{
      boundryHeight = Math.floor(this.heightPx * 1.2);
      boundryWitdh = Math.floor(this.widthPx * 1.2);
      viewportHeight = this.heightPx;
      viewportWidth = this.widthPx;
    }

    this.croppieObject = $(ele).croppie({
      viewport: {
        width: viewportWidth,
        height: viewportHeight,
        type:'square'
      },
      boundary: {
        width: boundryWitdh,
        height: boundryHeight
      },
      enforceBoundary:false
    });
  }

  saveImageFromCroppie() {
    console.log(this.heightPx, this.widthPx);
    this.croppieObject
      .croppie("result", {
        type: "base64",
        size: {width:parseInt(this.widthPx),height:parseInt(this.heightPx)},
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
                  console.warn(err);
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
                  console.warn(err);
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
                console.warn(err);
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
                console.warn(err);
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
      console.log('load event')
      this.croppieImage = "";
      this.croppieHidden = false;
      this.croppieObject.croppie("bind", { url: fr.result }).then(res => {

      });
    };
    fr.readAsDataURL(file);
  }
}

 var gcd = function(a, b) {
  if (!b) {
    return a;
  }

  return gcd(b, a % b);
}

 var defaultRatioCalculation = function( providedWidth, providedHeight, containerWidth ){

      providedWidth = parseInt(providedWidth);
      providedHeight = parseInt(providedHeight);

      let GCF = gcd(providedWidth, providedHeight);

      let widthRatio = Math.floor(providedWidth/GCF);
      let heightRatio = Math.floor(providedHeight/GCF);

      let ratioedWidth = Math.floor((containerWidth/widthRatio)*heightRatio);
      return ratioedWidth;
    }
