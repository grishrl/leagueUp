import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MarkdownParserService } from '../services/markdown-parser.service';
import { UtilitiesService } from '../services/utilities.service';
import { HttpServiceService } from '../services/http-service.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-mini-carousel',
  templateUrl: './mini-carousel.component.html',
  styleUrls: ['./mini-carousel.component.css']
})
export class MiniCarouselComponent implements OnInit {

  constructor( private router: Router, public md: MarkdownParserService, public util:UtilitiesService, private http: HttpClient) { }

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

  listId: string;
  @Input() set playlistId(catId){
    if(this.util.isNullOrEmpty(catId)){

    }else{
      this.listId = catId;
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
    return '#' + this.listId;
  }

  ngOnInit() {
    let url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=3&playlistId=' + this.listId + '&key=AIzaSyD2eeQyVPBpeCIgytCPdie3jd6YAEzCUNc';
    this.http.get(url).subscribe(
      res=>{
        this.carousel = res['items'];
      }
    )
  }

  goToBlogPage(blog) {
    let videoId = blog.snippet.resourceId.videoId;
    let playlistId = blog.snippet.playlistId;
    let url = 'https://www.youtube.com/watch?v='+videoId+'&list='+playlistId;
    window.open(url,'_blank');
  }

}
