import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ContentfulService } from '../services/contentful.service';
import { Router } from '@angular/router';
import { MarkdownParserService } from '../services/markdown-parser.service';
import { UtilitiesService } from '../services/utilities.service';
import { environment } from 'src/environments/environment';
import { timer, Subscription, Subject, Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { animate, AnimationBuilder, AnimationFactory, AnimationPlayer, style, trigger, state, transition } from '@angular/animations';

@Component({
  selector: 'app-large-carousel',
  templateUrl: './large-carousel.component.html',
  styleUrls: ['./large-carousel.component.css']
})
export class LargeCarouselComponent implements OnInit {



  constructor(private contentfulService: ContentfulService, private router: Router, public md: MarkdownParserService, public util: UtilitiesService, private builder: AnimationBuilder) { }

  //helper for monitoring time of the carousel
  private reset$: BehaviorSubject<any>;

  @ViewChild('heroSlider') private carouselEl: ElementRef

  //carousel array of article info for slider
  carousel: any = [];

  //current pointer info
  currentPointer = 0;


  //slide model
  currentSlide = {
    sys:{
      id:null
    },
    fields:{
      title:'',
      description:'',
      heroImage:{
        fields:{
          file:{
            url:null
          }
        }
      }
  }
};

player

timing = 300;

//helper function to assign the current display slide to the passed int representing an index in the carousel array
  assignSlide(pointer){
    if(pointer>this.carousel.length || pointer < 0){
      pointer = 0;
    }
    this.currentSlide = this.carousel[pointer];
  }

  //animates the fade in / out of the slides
  animateSlides(callback){
    const fadeOut: AnimationFactory = this.builder.build([
      animate(300, style({ opacity: 0 }))
    ]);

    const fadeIn: AnimationFactory = this.builder.build([
      animate(300, style({ opacity: 1 }))
    ]);

    let fadeInPlayer = fadeIn.create(this.carouselEl.nativeElement);

    this.player = fadeOut.create(this.carouselEl.nativeElement);

    this.player.onDone(
      () => {

        callback();

        fadeInPlayer.play();

      }
    )
    this.player.play();
    this.reset$.next(null);
  }

  //loads next slide
  next() {
    let nextFunction = function(){
      let res = this.currentPointer + 1;
      if (res < this.carousel.length) {
        this.currentPointer = res;
        this.assignSlide(this.currentPointer);
      } else {
        this.currentPointer = 0;
        this.assignSlide(this.currentPointer);
      }
    }.bind(this);
    this.animateSlides(nextFunction);
  }

  //loads previous slide
  prev() {
    let prevFunction = function(){
      let res = this.currentPointer - 1
      if (res > -1) {
        this.currentPointer = res;
        this.assignSlide(this.currentPointer);
      } else {
        this.currentPointer = this.carousel.length - 1;
        this.assignSlide(this.currentPointer);
      }
    }.bind(this);
    this.animateSlides(prevFunction);

  }

  slideTo(num) {
    if (this.carousel[num]) {
      this.currentPointer = num;
      this.assignSlide(this.currentPointer);
    }
  }

  categoryID: string;
  @Input() set category(catId) {
    if (this.util.isNullOrEmpty(catId)) {

    } else {
      this.categoryID = catId;
    }
  }

  display: string;
  @Input() set byline(byline) {
    if (this.util.isNullOrEmpty(byline)) {

    } else {
      this.display = byline;
    }
  }

  createBind() {
    return '#' + this.categoryID;
  }



  ngOnInit() {
    this.contentfulService.getBlogs((Object.assign({ content_type: 'blogPost' }, { links_to_entry: environment.contentful.categoryIDs.jumbotron, order: '-sys.createdAt', limit: 3 }))).then(res => {
      this.carousel = res;
      this.assignSlide(this.currentPointer);
    })
  }

  subscription: Subscription
  ngAfterViewInit(): void {
    this.reset$ = new BehaviorSubject(null);
    this.subscription = this.reset$.pipe(
      switchMap(
        () => timer(10000))
    ).subscribe(
      () => {
        this.next();
      }
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  goToBlogPage(blog) {
    this.contentfulService.cacheBlog(blog);
    this.router.navigate(['/blog', blog.sys.id]);
  }



}
