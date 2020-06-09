import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpServiceService } from './http-service.service';
import { FilterService } from '../services/filter.service';

@Injectable({
  providedIn: "root",
})
export class DivisionService {
  //returns and sorts all divisions
  getDivisionInfo() {
    let turl = "/division/get/all";
    return this.httpService.httpGet(turl, []).pipe(
      map((res) => {
        let divisionArr = res;
        divisionArr = divisionArr.sort((a, b) => {
          return this.fs.arrangeDivisions(a, b);
        });
        return divisionArr;
      })
    );
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
    return this.httpService.httpGet(url, parameters);
  }

  //
  getDivisionAny(divInfo: string): Observable<any> {
    let url = "/division/get/any";
    let parameters = [{ q: encodeURIComponent(divInfo) }];
    return this.httpService.httpGet(url, parameters);
  }

  constructor(
    private httpService: HttpServiceService,
    private fs: FilterService
  ) {}
}


  // getDivInfo(divisionName:string){
  //   let url = 'admin/getDivInfo'

  //   return this.http.get<any>(url + '?division=' + divisionName).pipe(
  //     map((res) => {
  //       return res.returnObject;
  //     }));
  // }
