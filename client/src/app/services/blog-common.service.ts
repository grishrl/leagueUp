import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BlogCommonService {

  constructor(private router: Router) { }

  goToBlogPage(blog) {
    this.router.navigate(['/blog', blog.slug]);
  }

  authorObj(){
    return{
      fields:{
        'shortBio':'',
        'name':'',
        image:{
          fields:{
            file:{
              'url':''
            }
          }
        }
      },
      sys:{
        id:''
      }
    }
  }

  blogObj() {
    return {
  'fields':
  {
    'publishDate': null,
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
