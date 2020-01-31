import { Component, OnInit, Input } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { MarkdownParserService } from 'src/app/services/markdown-parser.service';
import { BlogCommonService } from 'src/app/services/blog-common.service';
import { WordpressService } from 'src/app/services/wordpress.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-blog-headline',
  templateUrl: './blog-headline.component.html',
  styleUrls: ['./blog-headline.component.css']
})
export class BlogHeadlineComponent implements OnInit {

  // blog = this.blogCommon.blogObj();
  blog = {
    title:'',
    author:'',
    excerpt:'',
    date:null,
    postThumbnail:null
  };
  imageUrl;

  @Input() set blogObj(blog){
    this.blog = blog;
  }
  constructor(public util: UtilitiesService, public md: MarkdownParserService, public blogCommon: BlogCommonService, public WP:WordpressService) { }

  dateObject
  ngOnInit() {
    if (this.blog  && this.blog.date){
      this.dateObject = moment(this.blog.date);
    }

    if(this.blog && this.blog.postThumbnail){
      this.WP.getCacheImage(this.blog.postThumbnail).subscribe(
        res=>{
          this.imageUrl = res;
        }
      );
    }

  }

}
