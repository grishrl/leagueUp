import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BlogCommonService {

  constructor(private router: Router) { }

  goToBlogPage(blog) {
    // this.contentfulService.cacheBlog(blog);
    this.router.navigate(['/blog', blog.sys.id]);
  }
}
