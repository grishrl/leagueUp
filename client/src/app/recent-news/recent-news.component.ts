import { Component, OnInit } from '@angular/core';
import { WordpressService } from '../services/wordpress.service';

@Component({
  selector: 'app-recent-news',
  templateUrl: './recent-news.component.html',
  styleUrls: ['./recent-news.component.css']
})
export class RecentNewsComponent implements OnInit {

  constructor( private WP: WordpressService) { }

  blogs = [];
  ngOnInit() {
    this.WP.getBlogPosts([{ categories: '14' }, { 'filter[orderby]': 'date' }, { 'order': 'desc' }, {per_page: 4}]).subscribe(
      res=>{
        this.blogs = res.posts;
      }
    )
  }

}
