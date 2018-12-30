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

  }

  private modifyBody(body: any) {
    /*
    * write your logic to modify the body
    * */
  }
}
