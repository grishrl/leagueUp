import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ContentfulService } from 'src/app/services/contentful.service';

@Component({
  selector: 'app-blog-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  constructor(private contentfulService: ContentfulService) { }
  categories: any[]
  selectedCat:string = 'all';

  @Output() currentCategory = new EventEmitter();


  ngOnInit() {
    this.contentfulService.getCategories().then(res => {
      this.categories = res;
    });

  }
  selectCategory(cat) {
    this.selectedCat = cat;
    //emit selected cat
    this.currentCategory.emit(cat);
  }

}
