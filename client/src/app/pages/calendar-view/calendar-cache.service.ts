import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalendarCacheService {

  constructor() {
    this.cache = new Map();
   }
  private cache;

  getCache(key){
    if(this.cache.has(key)){
      if(Date.now()-this.cache.get(`${key}timeStamp`)>300000){
        return 'getNewData';
      }else{
        return this.cache.get(key);
      }
    }else{
      return null;
    }
  }

  setCache(key, value){
    this.cache.set(key, value);
    this.cache.set(`${key}timeStamp`, Date.now());
  }
}
