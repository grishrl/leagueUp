import { Injectable } from '@angular/core';
// import { createClient, Entry } from 'contentful';

@Injectable({
  providedIn: 'root'
})
export class ContentfulService {

/*
  localCategories: any[] = [];

  constructor() {

  }

  async getAuthors(query): Promise<Entry<any>[]> {
    try {
      const res = await this.client.getEntries((Object.assign({ content_type: 'person' }, query)));
      return res.items;
    }
    catch (err) {
      console.log(err);
    }
  }

  async getCategories():Promise<Entry<any>[] >{
      try {
      const res = await this.client.getEntries((Object.assign({ content_type: 'category' })));
      return res.items;
    }
    catch (err) {
      console.log(err);
    }
  }

  async getBlogs(query?:object):Promise<Entry<any>[]>{
    try {
      const res = await this.client.getEntries((Object.assign({ content_type: 'blogPost'}, query)));
      this.clearCache();
      return res.items;
    }
    catch (err) {
      return err;
    }
  }

  async getBlog(blog) {
    const res = await this.client.getEntry(blog);
    return res;
  }


  tempBlog: any;
  //store this blog in the local service so we don't have to HTTP request it again
  cacheBlog(blog){
    this.tempBlog=blog;
  }
  clearCache(){
    this.tempBlog = {};
  }
  getCache(){
    if (this.tempBlog == undefined || this.tempBlog == null){
     return null;
    }
    var prop = Object.keys(this.tempBlog);
    if(prop.length == 0){
      return null;
    }else{
      return this.tempBlog;
    }

  }
  */
}
