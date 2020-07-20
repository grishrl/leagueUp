import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UtilitiesService } from './utilities.service';
import { map, share, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpServiceService } from './http-service.service';

@Injectable({
  providedIn: "root"
})
export class WordpressService {
  baseURL = "blog/blogs";

  constructor(
    private Http: HttpClient,
    private Util: UtilitiesService,
    private http: HttpServiceService
  ) {}

  // getBlogPosts(params?){
  //   let paramString = '';
  //   if (params) {
  //     params.forEach((element, index) => {
  //       let key = Object.keys(element);
  //       if (index == 0) {
  //         paramString += '?' + key[0] + '=' + element[key[0]];
  //       } else {
  //         paramString += '&' + key[0] + '=' + element[key[0]];
  //       }

  //     });
  //   }
  //   return this.Http.get(`${this.baseURL}/posts${paramString}`, { observe: 'response' }).pipe(
  //       map((data:any) => {
  //         // console.log(data.headers.headers);
  //         let blogTotal = parseInt(data.headers.headers.get('x-wp-total')[0]);
  //         let blogPages = parseInt(data.headers.headers.get('x-wp-totalpages')[0]);
  //         // console.log(blogTotal);
  //         // console.log(blogPages);
  //         // console.log(data.body);
  //         let returnData= {
  //           totalBlogs:blogTotal,
  //           pages:blogPages,
  //           posts:[]
  //         };
  //         data.body.forEach(post=>{
  //           returnData.posts.push(this.postFormater(post));
  //           this.postCache[post.id] = this.postFormater(post);
  //         });
  //         return returnData;
  //       })

  //   )
  // }

  getBlogPosts(params?) {
    const payload = {
      action: "getBlogPosts"
    };
    if (params) {
      payload["params"] = params;
    }
    return this.http.httpPost(this.baseURL, payload, false).pipe(
      map(data => {
        let formattedPosts = [];
        data.posts.forEach(post => {
          formattedPosts.push(this.postFormater(post));
        });
        data.posts = formattedPosts;
        return data;
      })
    );
  }

  // getBlogPost(id) {
  //   return this.Http.get(`${this.baseURL}/posts/${id}`).pipe(
  //     map(data => {
  //       return this.postFormater(data);
  //     })
  //   );
  // }

  getBlogPost(id) {
    const payload = {
      action: "getBlogPost"
    };
    if (id) {
      payload["params"] = id;
    }
    return this.http.httpPost(this.baseURL, payload, false).pipe(
      map(data => {
        if (data.posts.lenght > 0) {
          return this.postFormater(data.posts[0]);
        } else {
          return {};
        }
      })
    );
  }

  // getPostByAuthor(authorId) {
  //   return this.Http.get(`${this.baseURL}/posts?author=${authorId}`).pipe(
  //     map((data: any[]) => {
  //       let returnData = [];
  //       data.forEach(post => {
  //         returnData.push(this.postFormater(post));
  //       });
  //       return returnData;
  //     })
  //   );
  // }

  getPostByAuthor(authorId) {
    const payload = {
      action: "getPostByAuthor"
    };
    if (authorId) {
      payload["params"] = authorId;
    }
    return this.http.httpPost(this.baseURL, payload, false).pipe(
      map(data => {
        let returnData = [];
        data.posts.forEach(post => {
          returnData.push(this.postFormater(post));
        });
        return returnData;
      })
    );
  }

  // getPostsByCategory(categoryId) {
  //   return this.Http.get(`${this.baseURL}/posts?categories=${categoryId}`).pipe(
  //     map((data: any[]) => {
  //       let returnData = [];
  //       data.forEach(post => {
  //         returnData.push(this.postFormater(post));
  //       });
  //       return returnData;
  //     })
  //   );
  // }

  getPostsByCategory(categoryId) {
    return this.getBlogPosts([{ categories: categoryId }]).pipe(
      map(data => {
        let returnData = [];
        data.posts.forEach(post => {
          returnData.push(this.postFormater(post));
        });
        return returnData;
      })
    );
  }

  // getAuthors() {

  //   return this.Http.get<any[]>(`${this.baseURL}/users?per_page=100`).pipe(
  //     map(data => {
  //       let returnData = [];
  //       data.forEach(auth => {
  //         this.authorCache[auth.id] = this.authorFormatter(auth);
  //         returnData.push(this.authorFormatter(auth));
  //       });
  //       return returnData;
  //     })
  //   );
  // }

  getAuthors() {
    const payload = {
      action: "getAuthors"
    };
    return this.http.httpPost(this.baseURL, payload, false).pipe(
      map(data => {
        let returnData = [];
        data.forEach(auth => {
          this.authorCache[auth.id] = this.authorFormatter(auth);
          returnData.push(this.authorFormatter(auth));
        });
        return returnData;
      })
    );
  }

  // getAuthor(authorId) {
  //   return this.Http.get(`${this.baseURL}/users/${authorId}`).pipe(
  //     map(data => {
  //       return this.authorFormatter(data);
  //     })
  //   );
  // }

  getAuthor(authorId) {
    const payload = {
      action: "getAuthor"
    };
    if (authorId) {
      payload["params"] = authorId;
    }
    return this.http.httpPost(this.baseURL, payload, false).pipe(
      map(data => {
        return this.authorFormatter(data);
      })
    );
  }

  // getCategories() {
  //   return this.Http.get(`${this.baseURL}/categories?per_page=100`).pipe(
  //     data => {
  //       return data;
  //     }
  //   );
  // }

  getCategories() {
    const payload = {
      action: "getCategories"
    };
    return this.http.httpPost(this.baseURL, payload);
  }

  // getMedia(id) {
  //   return this.Http.get(`${this.baseURL}/media/${id}`).pipe(
  //     map(data => {
  //       return this.Util.returnByPath(data, "guid.rendered");
  //     })
  //   );
  // }

  getMedia(id) {
    const payload = {
      action: "getMedia"
    };
    if(id){
      payload['params']=id;
    }
    return this.http.httpPost(this.baseURL, payload).pipe(
      map(
        data => {
        return this.Util.returnByPath(data, "source_url");
      })
    );
  }

  private authorFormatter(auth: any) {
    let tO = {};
    tO["id"] = auth["id"];
    tO["name"] = auth["name"];
    tO["description"] = auth["description"];
    if (this.Util.returnBoolByPath(auth, "simple_local_avatar.media_id")) {
      tO["image"] = this.Util.returnByPath(auth, "simple_local_avatar.full");
      tO["mediaId"] = this.Util.returnByPath(
        auth,
        "simple_local_avatar.media_id"
      );
    }
    return tO;
  }

  postFormater(post) {
    let tO = {};
    tO["id"] = post["id"];
    tO["date"] = post["date"];
    tO["slug"] = post["slug"];
    tO["title"] = this.Util.returnByPath(post, "title.rendered");
    tO["content"] = this.Util.returnByPath(post, "content.rendered");
    tO["excerpt"] = this.Util.returnByPath(post, "excerpt.rendered");
    tO["author"] = this.Util.returnByPath(post, "author");
    tO["categories"] = this.Util.returnByPath(post, "categories");
    tO["postThumbnail"] = this.Util.returnByPath(post, "featured_media");
    tO["tags"] = this.Util.returnByPath(post, "tags");
    return tO;
  }

  authorQueue = {};
  authorCache = {};

  getCacheAuthor(id) {
    return new Observable(subscriber => {
      if (this.authorCache[id]) {
        subscriber.next(this.authorCache[id]);
        subscriber.complete();
      } else if (this.authorQueue[id]) {
        this.authorQueue[id].subscribe(response => {
          subscriber.next(response);
          subscriber.complete();
        });
      } else {
        this.authorQueue[id] = this.getAuthor(id).pipe(shareReplay(1));

        this.authorExecutor(id).subscribe(response => {
          subscriber.next(response);
          subscriber.complete();
        });
      }
    });
  }

  authorExecutor(id) {
    let exec = this.authorQueue[id];
    return exec.pipe(
      map(res => {
        this.authorCache[id] = res;
        delete this.authorQueue[id];
        return res;
      })
    );
  }

  imageQueue = {};
  imageCache = {};

  getCacheImage(id) {
    return new Observable(subscriber => {
      if (this.imageCache[id]) {
        subscriber.next(this.imageCache[id]);
        subscriber.complete();
      } else if (this.imageQueue[id]) {
        this.imageQueue[id].subscribe(response => {
          subscriber.next(response);
          subscriber.complete();
        });
      } else {
        this.imageQueue[id] = this.getMedia(id).pipe(shareReplay(1));
        this.imageExecutor(id).subscribe(response => {
          subscriber.next(response);
          subscriber.complete();
        });
      }
    });
  }

  imageExecutor(id) {
    let exec = this.imageQueue[id];
    return exec.pipe(
      map(res => {
        this.imageCache[id] = res;
        delete this.imageQueue[id];
        return res;
      })
    );
  }

  postQueue = {};
  postCache = {};

  getCachePost(id) {
    return new Observable(subscriber => {
      if (this.postCache[id]) {
        subscriber.next(this.postCache[id]);
        subscriber.complete();
      } else if (this.postQueue[id]) {
        this.postQueue[id].subscribe(response => {
          subscriber.next(response);
          subscriber.complete();
        });
      } else {
        this.postQueue[id] = this.getBlogPost(id).pipe(shareReplay(1));
        this.postExecutor(id).subscribe(response => {
          subscriber.next(response);
          subscriber.complete();
        });
      }
    });
  }

  postExecutor(id) {
    let exec = this.postQueue[id];
    return exec.pipe(
      map(res => {
        this.postCache[id] = res;
        delete this.postQueue[id];
        return res;
      })
    );
  }
}

export class Author {
  id: string;
  name: string;
  description: string;
  image: string;
  mediaId: string;
  constructor(
  ){
    this.id='';
    this.name = '';
    this.description = '';
    this.image = '';
    this.mediaId = '';
  }
}

export class Post {
  id: string;
  date:string;
  slug:string;
  title: string;
  content:string;
  excerpt:string;
  author:string;
  categories:string;
  postThumbnail:string;
  tags: string;
  constructor(){
    this.id = '';
    this.date= '';
    this.slug ='';
    this.title= '';;
    this.content= '';;
    this.excerpt= '';;
    this.author= '';;
    this.categories= '';;
    this.postThumbnail= '';;
    this.tags= '';;
  }
}
