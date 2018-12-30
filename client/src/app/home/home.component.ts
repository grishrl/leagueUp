import { Component, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { ContentfulService } from '../services/contentful.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private contentfulService:ContentfulService, private router: Router) {

   }
  perColumn:number = 3;
  
  jumboTron: any;
  rows:any[]=[];

  ngOnInit() {
    this.contentfulService.getBlogs((Object.assign({content_type: 'blogPost'}, { links_to_entry: environment.contentful.categoryIDs.news, order:'-sys.createdAt', limit:6 }))).then(
      res => { 
        this.createMyDisplay(res);
      } 
    );
    this, this.contentfulService.getBlogs((Object.assign({ content_type: 'blogPost' }, { links_to_entry: environment.contentful.categoryIDs.jumbotron, order: '-sys.createdAt', limit: 3 }))).then( res => {
      this.jumboTron = res;
    })
  }

  createMyDisplay(dat) {
    if (!this.perColumn) {
      this.perColumn = 3;
    }
    this.rows = [];
    if (dat != undefined && dat.length > 0) {
      if (dat.length > this.perColumn) {
        let temparr = [];
        for (var i = 0; i < dat.length; i++) {
          if (i > 0 && i % this.perColumn == 0) {
            this.rows.push(temparr);
            temparr = [];
          }
          temparr.push(dat[i]);
        }
        if (temparr.length > 0) {
          this.rows.push(temparr);
        }
      } else {
        this.rows.push(dat);
      }
    } else {
      this.rows = [];
    }
  }

  goToBlogPage(blog) {
    this.contentfulService.cacheBlog(blog);
    this.router.navigate(['/blog', blog.sys.id]);
  }

}
