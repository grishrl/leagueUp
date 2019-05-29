import { Directive, Renderer2, ElementRef } from '@angular/core';
import { LeagueStatService } from './league-stat.service';

@Directive({
  selector: '[appLStat]'
})
export class LStatDirective {

  constructor(private ls: LeagueStatService, private el: ElementRef, private renderer:Renderer2) {
    this.ls.getStatInfoStream.subscribe(
      obj=>{
        this.el.nativeElement.innerText = obj['stat'] + ' ' + obj['text'];
        // let text = this.renderer.createText(obj['stat'] + ' ' + obj['text']);
        // this.renderer.appendChild(this.el.nativeElement, text);
      }
    );

   }

}
