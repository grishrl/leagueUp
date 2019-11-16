import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ContentfulService } from '../../services/contentful.service';
import { ActivatedRoute } from '@angular/router';
import { MarkdownParserService } from '../../services/markdown-parser.service';
import { merge } from 'lodash';
import { BlogCommonService } from 'src/app/services/blog-common.service';
import { WordpressService, Author } from 'src/app/services/wordpress.service';
import { Post } from 'src/app/services/wordpress.service';

@Component({
  selector: 'app-blog-view',
  templateUrl: './blog-view.component.html',
  styleUrls: ['./blog-view.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BlogViewComponent implements OnInit {

  //component properties
  recId: string  //local property for a receieved blog ID
  displayBlog:Post //local property to hold a fetched blog
  displayAuthor:Author

  constructor(private contentfulService:ContentfulService, private route: ActivatedRoute, public md:MarkdownParserService, public blogCommon:BlogCommonService, private WP:WordpressService) {
    //gets the ID from the url route
    if(this.route.snapshot.params['id']){
      this.recId = this.route.snapshot.params['id'];
    }

    this.route.data.subscribe(
      res=>{
        if(res.blogId){
          this.recId = res.blogId;
        }
      }
    )
   }

  ngOnInit() {
    //gets provided blog post from received id
    this.displayBlog = new Post();
    this.displayAuthor = new Author();
    this.WP.getCachePost(this.recId).subscribe(
      (res: Post)=>{
        this.displayBlog=res;
        this.WP.getCacheAuthor(this.displayBlog.author).subscribe(
          (auth:Author)=>{
            this.displayAuthor = auth;
          }
        )
      }
    )
  }

}
