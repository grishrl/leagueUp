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
   //this is used to parse the contentful returns as they are returned with markdown
   convertMarkdown(markdown:string){
     return this.md.parse(markdown);
   }
}
