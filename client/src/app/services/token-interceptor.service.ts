import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {
  
  constructor(public auth: AuthService, private router:Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        req = req.clone({ setHeaders:{
          Authorization: `Bearer ${this.auth.getToken()}`
        } });

        return next.handle(req).pipe(
          tap(
            event=>{
              if(event instanceof HttpResponse){
                if (event.headers.get('Authorization') != null && event.headers.get('Authorization')!= undefined){
                  let token = event.headers.get('Authorization');
                  token = token.replace('Bearer ', '');
                  this.auth.createAuth(token);
                }
              }
            },
            (err)=>{
              if(err.status==401){
                this.auth.destroyAuth('/sessionTimeOut')
                // this.router.navigateByUrl['/sessionTimeOut'];
              }else{

              }
              
            }
          )
        )
  }
}
