import { Component, OnInit, Input } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { MarkdownParserService } from 'src/app/services/markdown-parser.service';
import { BlogCommonService } from 'src/app/services/blog-common.service';

@Component({
  selector: 'app-blog-headline',
  templateUrl: './blog-headline.component.html',
  styleUrls: ['./blog-headline.component.css']
})
export class BlogHeadlineComponent implements OnInit {

  blog = this.blogCommon.blogObj();

  @Input() set blogObj(blog){
    this.blog = blog;
  }
  constructor(public util: UtilitiesService, public md: MarkdownParserService, public blogCommon: BlogCommonService) { }

  dateObject
  ngOnInit() {
    if (this.blog && this.blog.fields && this.blog.fields.publishDate){
      this.dateObject = new Date(this.blog.fields.publishDate);
    }

  }

}
