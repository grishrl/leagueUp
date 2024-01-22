import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {

  fourOhOneTimeoutList = [
    'localhost',
    'dev-ngs',
    'prod-ngs',
    'nexusgamingseries'
  ];
  urlBlacklist = [
    'googleapis',
    's3-client-uploads'
  ]

  constructor(public auth: AuthService, private router:Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    //appending a request header of authorization was causing errors with other services
    // this will check that the domain is not ours and if not it will not append the auth header
    // because the services all use a short hand URL to call this has to be bass-ackwards and use a blacklisting for now instead of excluding our known domains we have to include required domains
    if(req instanceof HttpRequest){
      if(this.checkDomainExistIn(req.url, this.urlBlacklist)){
        //do not append the NGS authorization to this request because the url is blacklisted
      }else{
        //if the URL
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${this.auth.getToken()}`
          }
        });
      }
    }



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

              if (err.status == 401 && this.checkDomainExistIn(err.url, this.fourOhOneTimeoutList)){
                this.auth.destroyAuth('/')
                // this.router.navigateByUrl['/sessionTimeOut'];
              }else{

              }

            }
          )
        )
  }


  checkDomainExistIn(url:string, list:Array<string>){
    let ret = false;
    list.forEach(item=>{
      if(url.indexOf(item) > -1 ){
        ret = true;
      }
    });
    return ret;
  }

}
