import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarkdownParserService } from '../services/markdown-parser.service';

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

  constructor(private route: ActivatedRoute, public md: MarkdownParserService) {
    //gets the ID from the url route
  }

  ngOnInit() {

  }

}
