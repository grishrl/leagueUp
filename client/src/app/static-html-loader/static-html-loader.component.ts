import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SafeHtmlPipe } from './safeHtml.pipe';

@Component({
  selector: 'app-static-html-loader',
  templateUrl: './static-html-loader.component.html',
  styleUrls: ['./static-html-loader.component.css']
})
export class StaticHtmlLoaderComponent implements OnInit {

  templateName:string
  pageHeader = '';

  pageHeaders = {
    'template':'Default Template',
    'asdf':'ASDF',
    '404': 'Not Found'
  }
  constructor(private route:ActivatedRoute, private http:HttpClient) {
    if (route.snapshot.params['id']) {
      let URI = decodeURIComponent(route.snapshot.params['id']);
      this.templateName = URI;
      this.pageHeader=this.pageHeaders[this.templateName];
    }
   }

  loadedHTML = '';
  ngOnInit() {
    // const headers = new HttpHeaders({ 'Content-Type': 'text/html; charset=utf-8' , 'Accept':'text/html; charset=utf8'});
    if(this.templateName){
      this.templateLoader(this.templateName);
    }else{
      this.route.data.subscribe(
        data => {
          this.pageHeader = data.headerText;
          this.templateLoader(data.template);
        },err=>{
            console.warn(err);
          });
    }

  }

  templateLoader(template){
        let templateName = 'assets/templates/' + template + '.html';
        this.http.get(templateName, {
          responseType: 'text'
        }).subscribe(
          res => {
            if (res.includes('<app-root></app-root>')){
              this.templateLoader('404');
            }else{
              this.loadedHTML = res;
            }
          },
          err => {
            console.warn(err);
          }
        )
  }


}


