import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { HttpService } from "./http.service";

@Injectable({
  providedIn: 'root'
})
export class S3uploadService {

  constructor(private nativeHttp:HttpClient, private ngsHttp:HttpService) { }

  getSignedUrl(inf){
    let url = "api/s3/sign";
    return this.ngsHttp.httpPost(url, inf);
  }

  s3put(signedUrl:string, file:any){
    // const HttpUploadOptions = {
    //   headers: new HttpHeaders({
    //     "Content-Type": this.file.type,
    //     Accept: "*/*",
    //   }),
    // };
    return this.nativeHttp.put(signedUrl, file);
  }
}
