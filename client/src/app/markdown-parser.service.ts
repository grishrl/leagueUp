import { Injectable } from '@angular/core';
import * as marked from 'marked';

@Injectable({
  providedIn: 'root'
})
export class MarkdownParserService {

  private md

  constructor() {
    this.md = marked;
   }

   convertMarkdown(markdown:string){
     return this.md.parse(markdown);
   }
}
