import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { FilterService } from '../services/filter.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: "root",
})
export class DivisionService {
  //returns and sorts all divisions
  getDivisionInfo() {
    let turl = "/division/get/all";
    let cached = this.checkCache('all');
    if(cached){
      return of(cached);
    }else{
          return this.cache.getCached(turl, this.httpService.httpGet(turl, []).pipe(
      map((res) => {
        let divisionArr = res;
        divisionArr = divisionArr.sort((a, b) => {
          return this.fs.arrangeDivisions(a, b);
        });
        this.cacheAll(divisionArr);
        return divisionArr;
      })
    ));
    }

  }

  //return division given a team name:
  getDivisionTeam(teamName: string): Observable<any> {
    let url = "/division/get/by/teamname";
    let parameters = [{ teamName: encodeURIComponent(teamName) }];
    return this.httpService.httpGet(url, parameters);
  }

  //returns division information of provided division; divisionConcat
  getDivision(divisionName: string): Observable<any> {
    let url = "/division/get";
    let parameters = [{ division: divisionName }];
    let cachedDiv = this.checkCache(divisionName);
    if(cachedDiv){
      return of(cachedDiv);
    }else{
      return this.httpService.httpGet(url, parameters).pipe(
      map(res=>{
        this.cacheDiv(res);
        return res;
      })
    );
    }
  }

  private divisionCache = {

  }

  private cacheDiv(div){
    if(!this.divisionCache.hasOwnProperty(div.divisionConcat)){
      this.divisionCache[div.divisionConcat]=JSON.stringify(div);
    }
  }

  private cacheAll(allDiv){
    if(!this.divisionCache.hasOwnProperty('all')){
      this.divisionCache['all']=JSON.stringify(allDiv);
    }
    allDiv.forEach(
      div=>{
        this.cacheDiv(div);
      }
    )
  }

  private checkCache(div){
    if(this.divisionCache.hasOwnProperty(div)){
      // console.log('div',JSON.parse(this.divisionCache[div]));
      return JSON.parse(this.divisionCache[div]);
    }else{
      return false;
    }
  }

  //
  getDivisionAny(divInfo: string): Observable<any> {
    let url = "/division/get/any";
    let parameters = [{ q: encodeURIComponent(divInfo) }];
    return this.httpService.httpGet(url, parameters);
  }

  constructor(
    private httpService: HttpService,
    private fs: FilterService,
    private cache:CacheService
  ) {}
}
