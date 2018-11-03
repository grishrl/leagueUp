import { Component, OnInit } from '@angular/core';
import { ContentfulService } from '../contentful.service';
import { ActivatedRoute } from '@angular/router';
import { MarkdownParserService } from '../markdown-parser.service';

@Component({
  selector: 'app-blog-view',
  templateUrl: './blog-view.component.html',
  styleUrls: ['./blog-view.component.css']
})
export class BlogViewComponent implements OnInit {

  constructor(private contentfulService:ContentfulService, private route: ActivatedRoute, private md:MarkdownParserService) {
    if(this.route.snapshot.params['id']){
      this.recId = this.route.snapshot.params['id'];
    }
   }
  recId:string 
  displayBlog:any
  ngOnInit() {
    if(this.contentfulService.getCache()){
      console.log('a cached blog was found', this.contentfulService.getCache())
      this.displayBlog = this.contentfulService.getCache();
      this.contentfulService.getCache();
    }else{
      this.contentfulService.getBlog(this.recId).then(
        res=>{
          this.displayBlog = res;
          console.log(res);
        }
      )
    }
  }

}
