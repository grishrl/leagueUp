import { Component, OnInit } from '@angular/core';
import { BlogCommonService } from 'src/app/services/blog-common.service';
import { ContentfulService } from 'src/app/services/contentful.service';
import { ActivatedRoute } from '@angular/router';
import { MarkdownParserService } from 'src/app/services/markdown-parser.service';
import { merge } from 'lodash';
import { WordpressService } from 'src/app/services/wordpress.service';
import { Author } from 'src/app/services/wordpress.service';

@Component({
  selector: 'app-author-page',
  templateUrl: './author-page.component.html',
  styleUrls: ['./author-page.component.css']
})
export class AuthorPageComponent implements OnInit {

  recId;
  authorInf:Author;
  posts = [];

  constructor(private contentfulService: ContentfulService, private route: ActivatedRoute, public md: MarkdownParserService, public blogCommon: BlogCommonService, private WP:WordpressService) {
    //gets the ID from the url route
    if (this.route.snapshot.params['id']) {
      this.recId = this.route.snapshot.params['id'];
    }

    this.route.data.subscribe(
      res => {
        if (res.blogId) {
          this.recId = res.blogId;
        }
      }
    )
   }

  ngOnInit() {
    this.authorInf = new Author();
    this.WP.getCacheAuthor(this.recId).subscribe(
      (auth:Author)=>{
        this.authorInf = auth;
        this.WP.getBlogPosts([{ author: this.recId }, { 'filter[orderby]': 'date' }, { 'order': 'desc' }]).subscribe(
          posts=>{
            this.posts = posts.posts;
          }
        )
      }
    )

      // this.contentfulService.getAuthors( {'fields.name':this.recId} ).then(
      //   res => {

      //     merge(this.authorInf, res[0]);

      //     //get authors posts now
      //     this.contentfulService.getBlogs({ 'links_to_entry': this.authorInf.sys.id, order: '-sys.createdAt' }).then(
      //       res => {
      //         this.posts = res;
      //       }
      //     )
      //   }
      // );


    }
  }
