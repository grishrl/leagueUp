import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ContentfulService } from 'src/app/services/contentful.service';

@Component({
  selector: 'app-author-list',
  templateUrl: './author-list.component.html',
  styleUrls: ['./author-list.component.css']
})
export class AuthorListComponent implements OnInit {

  constructor(private contentfulService: ContentfulService) { }

  @Output() currentAuthor = new EventEmitter();

  selectedAuthor = 'all';
  authors=[];

  ngOnInit() {
    this.contentfulService.getAuthors({}).then(
      res=>{
        console.log('authors ', res);
        this.authors = res;
      }
    )
  }

  selectAuthor(auth){
    this.selectedAuthor = auth;
    this.currentAuthor.emit(auth);
  }

}
