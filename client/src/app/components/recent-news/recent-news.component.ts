import { Component, OnInit } from '@angular/core';
import { WordpressService } from '../../services/wordpress.service';
import { map, mergeMap } from 'rxjs/operators'

@Component({
  selector: 'app-recent-news',
  templateUrl: './recent-news.component.html',
  styleUrls: ['./recent-news.component.css']
})
export class RecentNewsComponent implements OnInit {

  private CATSTRING = 'News'

  constructor( private WP: WordpressService) { }

  blogs = [];
  ngOnInit() {
    this.WP.getCategoryId(this.CATSTRING).pipe(
      mergeMap(
        catId=>{
              return this.WP.getBlogPosts([{ categories: catId }, { 'filter[orderby]': 'date' }, { 'order': 'desc' }, {per_page: 4}]);
        }
    )).subscribe(
      res=>{
        this.blogs = res.posts;
      }
    )

  }

}
