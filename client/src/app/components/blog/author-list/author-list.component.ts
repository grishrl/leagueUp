import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { WordpressService } from 'src/app/services/wordpress.service';

@Component({
  selector: 'app-author-list',
  templateUrl: './author-list.component.html',
  styleUrls: ['./author-list.component.css']
})
export class AuthorListComponent implements OnInit {

  constructor(private WP:WordpressService) { }

  @Output() currentAuthor = new EventEmitter();

  selectedAuthor = 'all';
  authors;

  ngOnInit() {
    this.WP.getAuthors().subscribe(
      res=>{
        this.authors=res;
      }
    )
  }

  selectAuthor(auth){
    this.selectedAuthor = auth;
    this.currentAuthor.emit(auth);
  }

}
