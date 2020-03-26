import { Component, OnInit, Input } from '@angular/core';
import { WordpressService } from 'src/app/services/wordpress.service';
import { Author } from 'src/app/services/wordpress.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-author-name',
  templateUrl: './author-name.component.html',
  styleUrls: ['./author-name.component.css']
})
export class AuthorNameComponent implements OnInit {

  constructor(private WP:WordpressService, private util:UtilitiesService) { }

  @Input() authorId;

  @Input() link;

  authorInfo:Author = {
    name:'',
    description:'',
    id:'',
    image:'',
    mediaId:''
  };

  ngOnInit() {
    if(this.util.isNullOrEmpty(this.link)){
      this.link = true;
    }
    this.WP.getCacheAuthor(this.authorId).subscribe(
      (res: Author)=>{
        this.authorInfo = res;
      }
    )

  }

}
