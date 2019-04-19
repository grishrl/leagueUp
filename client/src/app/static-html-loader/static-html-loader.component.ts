import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-static-html-loader',
  templateUrl: './static-html-loader.component.html',
  styleUrls: ['./static-html-loader.component.css']
})
export class StaticHtmlLoaderComponent implements OnInit {

  templateName:string
  constructor(private route:ActivatedRoute, private http:HttpClient) {
    if (route.snapshot.params['id']) {
      let URI = decodeURIComponent(route.snapshot.params['id']);
      this.templateName = URI;
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
          console.log('data: ', data);
          this.templateLoader(data.template);
        },err=>{
            console.log(err);
          });
    }

  }

  templateLoader(template){
        let templateName = 'assets/templates/' + template + '.html';
        this.http.get(templateName, {
          responseType: 'text'
        }).subscribe(
          res => {
            this.loadedHTML = res;
            console.log(res);
          },
          err => {
            console.log(err);
          }
        )
  }


}
