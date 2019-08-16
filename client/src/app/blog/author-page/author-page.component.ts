import { Component, OnInit } from '@angular/core';
import { BlogCommonService } from 'src/app/services/blog-common.service';
import { ContentfulService } from 'src/app/services/contentful.service';
import { ActivatedRoute } from '@angular/router';
import { MarkdownParserService } from 'src/app/services/markdown-parser.service';
import { merge } from 'lodash';

@Component({
  selector: 'app-author-page',
  templateUrl: './author-page.component.html',
  styleUrls: ['./author-page.component.css']
})
export class AuthorPageComponent implements OnInit {

  recId;
  authorInf = this.blogCommon.authorObj();
  posts = [];

  constructor(private contentfulService: ContentfulService, private route: ActivatedRoute, public md: MarkdownParserService, public blogCommon: BlogCommonService) {
    //gets the ID from the url route
    if (this.route.snapshot.params['id']) {
      this.recId = this.route.snapshot.params['id'];
    }

    this.route.data.subscribe(
      res => {
        // console.log(res);
        if (res.blogId) {
          this.recId = res.blogId;
        }
      }
    )
   }

  ngOnInit() {
    // this.displayBlog = this.blogCommon.blogObj();
    //gets provided blog post from received id
    // if (this.contentfulService.getCache()) {
    //   this.displayBlog = this.contentfulService.getCache();
    //   this.contentfulService.getCache();
    // } else {
      this.contentfulService.getAuthors( {'fields.name':this.recId} ).then(
        res => {

          merge(this.authorInf, res[0]);

          //get authors posts now
          this.contentfulService.getBlogs({ 'links_to_entry': this.authorInf.sys.id }).then(
            res => {
              this.posts = res;
            }
          )
        }
      );


    }
  }
