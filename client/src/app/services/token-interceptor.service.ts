import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {
  
  constructor(public auth: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        req = req.clone({ setHeaders:{
          Authorization: `Bearer ${this.auth.getToken()}`
        } });
        return next.handle(req);
    // return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
    //   console.log('here is an intercepted event!!', event)
    //   if (event instanceof HttpRequest) {
    //     console.log('you see the HTTP request! ', event)
    //     event.clone({ setHeaders:{
    //       Authorization: `Bearer ${this.auth.getToken()}`
    //     } });
    //   }
    //   return event;
    // }));

  }

  private modifyBody(body: any) {
    /*
    * write your logic to modify the body
    * */
  }
}