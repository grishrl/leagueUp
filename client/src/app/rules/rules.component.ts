import { Component, OnInit } from '@angular/core';
import { ContentfulService } from '../services/contentful.service';
import { Entry } from 'contentful'
import { ActivatedRoute } from '@angular/router';
import { MarkdownParserService } from '../services/markdown-parser.service';
import { merge } from 'lodash';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit {

  displayBlog={
  'fields':
  {
    'description': '',
    'body': '',
    'author': {
        'fields':{
          'name':'',
        'shortBio': '',
        'image': {
          'fields': {
            'file': {
              'url': ''
            }
          }
        }
      }
    },
    'title': '',
      'heroImage': {
      'fields': {
        'file': {
          'url': ''
        }
      }
    }
  }

}
 //local property to hold a fetched blog
  blogID = '3BLsIya6ZiWQWka4IeUw2';

  constructor(private contentfulService: ContentfulService, private route: ActivatedRoute, public md: MarkdownParserService) {
    //gets the ID from the url route
  }

  ngOnInit() {

    //gets provided blog post from received id
    if (this.contentfulService.getCache()) {
      this.displayBlog = this.contentfulService.getCache();
      this.contentfulService.getCache();
    } else {
      this.contentfulService.getBlog(this.blogID).then(
        res => {
          merge(this.displayBlog, res);
          // this.displayBlog = res;
        }
      )
    }
  }

}
