import { Component, OnInit } from '@angular/core';
import { ContentfulService } from '../services/contentful.service';
import { ActivatedRoute } from '@angular/router';
import { MarkdownParserService } from '../services/markdown-parser.service';

@Component({
  selector: 'app-blog-view',
  templateUrl: './blog-view.component.html',
  styleUrls: ['./blog-view.component.css']
})
export class BlogViewComponent implements OnInit {

  //component properties
  recId: string  //local property for a receieved blog ID
  displayBlog: any  //local property to hold a fetched blog

  constructor(private contentfulService:ContentfulService, private route: ActivatedRoute, public md:MarkdownParserService) {
    //gets the ID from the url route
    if(this.route.snapshot.params['id']){
      this.recId = this.route.snapshot.params['id'];
    }
   }

  ngOnInit() {
    //gets provided blog post from received id
    if(this.contentfulService.getCache()){
      this.displayBlog = this.contentfulService.getCache();
      this.contentfulService.getCache();
    }else{
      this.contentfulService.getBlog(this.recId).then(
        res=>{
          this.displayBlog = res;
        }
      )
    }
  }

}
