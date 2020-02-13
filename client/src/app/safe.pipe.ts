import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {

  constructor( private sanatize:DomSanitizer){
  }

  transform(url: any): any {
    if(url && url.indexOf('undefined') == -1){
      return this.sanatize.bypassSecurityTrustResourceUrl(url);
    }
  }

}
