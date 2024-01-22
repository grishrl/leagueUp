import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({ name:'safeHtml'})
export class SafeHtmlPipe implements PipeTransform{
  constructor(private sanatized:DomSanitizer){}
  transform(value){
    return this.sanatized.bypassSecurityTrustHtml(value);
  }
}
