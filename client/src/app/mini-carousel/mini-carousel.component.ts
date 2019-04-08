import { Component, OnInit, Input } from '@angular/core';
import { ContentfulService } from '../services/contentful.service';
import { Router } from '@angular/router';
import { MarkdownParserService } from '../services/markdown-parser.service';
import { UtilitiesService } from '../services/utilities.service';

@Component({
  selector: 'app-mini-carousel',
  templateUrl: './mini-carousel.component.html',
  styleUrls: ['./mini-carousel.component.css']
})
export class MiniCarouselComponent implements OnInit {

  constructor(private contentfulService: ContentfulService, private router: Router, public md: MarkdownParserService, public util:UtilitiesService) { }

  carousel: any = [];


  currentSlide = 0;


  next(){
    let res = this.currentSlide + 1;
    if (res < this.carousel.length) {
      this.currentSlide = res;
    } else {
      this.currentSlide = 0;
    }
  }

  prev() {
    let res = this.currentSlide - 1
    if(res > -1){
      this.currentSlide = res;
    }else{
      this.currentSlide = this.carousel.length-1;
    }
  }

  slideTo(num){
    if(this.carousel[num]){
      this.currentSlide = num;
    }
  }

  categoryID: string;
  @Input() set category(catId){
    if(this.util.isNullOrEmpty(catId)){

    }else{
      this.categoryID = catId;
    }
  }

  display:string;
  @Input() set byline(byline){
    if (this.util.isNullOrEmpty(byline)) {

    } else {
      this.display = byline;
    }
  }

  createBind(){
    return '#' + this.categoryID;
  }

  ngOnInit() {
    this.contentfulService.getBlogs((Object.assign({ content_type: 'blogPost' }, { links_to_entry: this.categoryID, order: '-sys.createdAt', limit: 3 }))).then(res => {
      this.carousel = res;
    });
  }

  goToBlogPage(blog) {
    this.contentfulService.cacheBlog(blog);
    this.router.navigate(['/blog', blog.sys.id]);
  }

}
