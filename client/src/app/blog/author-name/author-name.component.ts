import { Component, OnInit, Input } from '@angular/core';
import { WordpressService } from 'src/app/services/wordpress.service';
import { Author } from 'src/app/services/wordpress.service';

@Component({
  selector: 'app-author-name',
  templateUrl: './author-name.component.html',
  styleUrls: ['./author-name.component.css']
})
export class AuthorNameComponent implements OnInit {

  constructor(private WP:WordpressService) { }

  @Input() authorId;

  authorInfo:Author = {
    name:'',
    description:'',
    id:'',
    image:'',
    mediaId:''
  };

  ngOnInit() {
    this.WP.getCacheAuthor(this.authorId).subscribe(
      (res: Author)=>{
        this.authorInfo = res;
      }
    )

  }

}
