import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BlogCommonService {

  constructor(private router: Router) { }

  goToBlogPage(blog) {
    this.router.navigate(['/blog', blog.sys.id]);
  }

  blogObj() {
    return {
  'fields':
  {
    'publishDate':0,
    'description': '',
    'body': '',
    'author': {
      'fields': {
        'name': '',
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
  },
  'sys':{
    'id':''
  }
};
}


}
