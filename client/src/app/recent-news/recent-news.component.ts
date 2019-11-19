import { Component, OnInit } from '@angular/core';
import { ContentfulService } from '../services/contentful.service';
import { environment } from '../../environments/environment';
import { UtilitiesService } from '../services/utilities.service';
import { MarkdownParserService } from '../services/markdown-parser.service';
import { BlogCommonService } from '../services/blog-common.service';
import { WordpressService } from '../services/wordpress.service';

@Component({
  selector: 'app-recent-news',
  templateUrl: './recent-news.component.html',
  styleUrls: ['./recent-news.component.css']
})
export class RecentNewsComponent implements OnInit {

  constructor(private contentfulService: ContentfulService, private WP: WordpressService) { }

  blogs = [];
  ngOnInit() {
    // this.contentfulService.getBlogs((Object.assign({ content_type: 'blogPost' }, { links_to_entry: environment.contentful.categoryIDs.news, order: '-sys.createdAt', limit: 4 }))).then(
    //   res => {
    //     this.blogs = res;
    //   }
    // );
    this.WP.getBlogPosts([{ categories: '14' }, { 'filter[orderby]': 'date' }, { 'order': 'desc' }, {per_page: 4}]).subscribe(
      res=>{
        this.blogs = res.posts;
      }
    )
  }

}
