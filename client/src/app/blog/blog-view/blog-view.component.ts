import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ContentfulService } from '../../services/contentful.service';
import { ActivatedRoute } from '@angular/router';
import { MarkdownParserService } from '../../services/markdown-parser.service';
import { merge } from 'lodash';
import { BlogCommonService } from 'src/app/services/blog-common.service';
import { WordpressService, Author } from 'src/app/services/wordpress.service';
import { Post } from 'src/app/services/wordpress.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: "app-blog-view",
  templateUrl: "./blog-view.component.html",
  styleUrls: ["./blog-view.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class BlogViewComponent implements OnInit {
  //component properties
  recId: string; //local property for a receieved blog ID
  displayBlog: Post; //local property to hold a fetched blog
  displayAuthor: Author;
  slug: string;
  sanatizedBlogContent;

  constructor(
    private contentfulService: ContentfulService,
    private route: ActivatedRoute,
    public md: MarkdownParserService,
    public blogCommon: BlogCommonService,
    private WP: WordpressService,
    public sanitizer: DomSanitizer
  ) {
    //gets the ID from the url route
    if (this.route.snapshot.params["id"]) {
      this.recId = this.route.snapshot.params["id"];
    }

    this.route.data.subscribe(res => {
      if (res.blogId) {
        this.recId = res.blogId;
      }
      if (res.slug) {
        this.slug = res.slug;
      }
    });
  }
  //sanitizer.bypassSecurityTrustHtml(displayBlog.content)
  ngOnInit() {
    //gets provided blog post from received id
    this.displayBlog = new Post();
    this.displayAuthor = new Author();
    if (this.recId) {
      this.WP.getBlogPosts([{ slug: this.recId }]).subscribe((res: any) => {
        this.displayBlog = res.posts[0];
        this.sanatizedBlogContent = this.sanitizer.bypassSecurityTrustHtml(this.displayBlog.content);
        this.WP.getCacheAuthor(this.displayBlog.author).subscribe(
          (auth: Author) => {
            this.displayAuthor = auth;
          }
        );
      });
    } else if (this.slug) {
      this.WP.getBlogPosts([{ slug: this.slug }]).subscribe((res: any) => {
        this.displayBlog = res.posts[0];
        this.sanatizedBlogContent = this.sanitizer.bypassSecurityTrustHtml(
          this.displayBlog.content
        );
        this.WP.getCacheAuthor(this.displayBlog.author).subscribe(
          (auth: Author) => {
            this.displayAuthor = auth;
          }
        );
      });
    }
  }
}
