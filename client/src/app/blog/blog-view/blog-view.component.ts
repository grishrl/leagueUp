import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ContentfulService } from '../../services/contentful.service';
import { ActivatedRoute } from '@angular/router';
import { MarkdownParserService } from '../../services/markdown-parser.service';
import { merge } from 'lodash';
import { BlogCommonService } from 'src/app/services/blog-common.service';

@Component({
  selector: 'app-blog-view',
  templateUrl: './blog-view.component.html',
  styleUrls: ['./blog-view.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BlogViewComponent implements OnInit {

  //component properties
  recId: string  //local property for a receieved blog ID
  displayBlog //local property to hold a fetched blog

  constructor(private contentfulService:ContentfulService, private route: ActivatedRoute, public md:MarkdownParserService, public blogCommon:BlogCommonService) {
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
    this.displayBlog = this.blogCommon.blogObj();
    //gets provided blog post from received id
    if(this.contentfulService.getCache()){
      this.displayBlog = this.contentfulService.getCache();
      this.contentfulService.getCache();
    }else{
      this.contentfulService.getBlog(this.recId).then(
        res=>{
          merge(this.displayBlog, res);
        }
      )
    }
  }

}
