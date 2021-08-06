import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarkdownParserService } from '../../../services/markdown-parser.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { WordpressService } from 'src/app/services/wordpress.service';
import { PageEvent, MatPaginator } from "@angular/material/paginator";

import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})

export class BlogListComponent implements OnInit, AfterViewInit {
  perColumn: number = 3;
  posts = [];
  constructor(private router: Router, public md: MarkdownParserService, public util: UtilitiesService, private WP:WordpressService,private notificationService:NotificationService) { }
  rows: any []=[];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  pageEvent:PageEvent

  ngAfterViewInit() {
    this.paginator.pageIndex = 0;
  }

  ngOnInit() {
    let params = [
      {'filter[orderby]':'date'},
      {'order':'desc'}
    ]

      this.loadingNotification();
      this.WP.getBlogPosts(params).subscribe(
        (data: any)=>{
          this.length = data.totalBlogs;
          this.posts = data.posts;
          this.doneNotification();
        }
      )
  }

  private loadingNotification(){
    this.notificationService.subj_notification.next('Loading Content...');
  }

  private doneNotification(){
    this.notificationService.subj_notification.next('Done.');
  }

  categorySelection:string;

  updateDisplay(val){
    this.categorySelection = val;
    this.getBlogsOfVal();

  }

  lastCat;
  lastAuth;

  length;
  pageSize=10;

  pageEventHandler(pageEvent: PageEvent) {
    let i = pageEvent.pageIndex * this.pageSize;
    let endSlice = i + this.pageSize;
    let pageReq = pageEvent.pageIndex+1;
    let query = [];

    query.push({ 'filter[orderby]': 'date' });
    query.push({ 'order': 'desc' });
    query.push({ 'page': pageReq });

    if (this.authorSelection && this.authorSelection != 'all') {

      query.push({ 'author': this.authorSelection });
      //call query of both...
    }
    if (this.categorySelection && this.categorySelection != 'all') {
      query.push({ 'categories': this.categorySelection });
    }
    this.loadingNotification();
    this.WP.getBlogPosts(query).subscribe(
      res => {
        this.posts = res.posts;
        this.doneNotification();
      }
    )

  }

  private getBlogsOfVal() {
    this.loadingNotification();
    let query = [];

    query.push({ 'filter[orderby]': 'date' });
    query.push({ 'order': 'desc' });

    if(this.authorSelection && this.authorSelection != 'all'){

      query.push( { 'author': this.authorSelection } );
      //call query of both...
    }
    if(this.categorySelection && this.categorySelection != 'all'){
      query.push({ 'categories': this.categorySelection} );
    }

    this.WP.getBlogPosts(query).subscribe(
      res=>{
        this.length = res.totalBlogs;
        this.posts = res.posts;
        this.paginator.firstPage();
        this.doneNotification();
      }
    )

  }

  authorSelection;
  updateDisplayAuthor(val){
    this.authorSelection = val;
    this.getBlogsOfVal();
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
          if (i>0 && i % this.perColumn == 0) {
            this.rows.push(temparr);
            temparr = [];
          }
          temparr.push(dat[i]);
        }
        if(temparr.length>0){
          this.rows.push(temparr);
        }
      } else {
        this.rows.push(dat);
      }
    } else {
      this.rows = [];
    }
  }


  goToBlogPage(blog){
    this.router.navigate(['/blog', blog.sys.id]);
  }

}
