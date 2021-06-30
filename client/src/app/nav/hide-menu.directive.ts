import { Directive, ElementRef } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

@Directive({
  selector: '[appHideMenu]'
})
export class HideMenuDirective {

  constructor(private el: ElementRef, private router: Router) {

    this.router.events.subscribe(
      event=>{
        if(event instanceof NavigationStart){
          this.el.nativeElement.style.display = 'none';
        }

      },
      err=>{
        console.warn(err);
      }
    )

   }



}
