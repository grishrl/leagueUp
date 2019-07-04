import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpServiceService } from './http-service.service';

@Injectable({
  providedIn: 'root'
})
export class DivisionService {

  //returns and sorts all divisions
  getDivisionInfo(){
    let turl = '/division/get/all';
    return this.httpService.httpGet(turl, []).pipe(
      map(
        res => {
          let divisionArr = res;
          divisionArr.sort((a, b) => {
            if (a.sorting < b.sorting) {
              return -1;
            }
            if (a.sorting > b.sorting) {
              return 1
            }
            return 0;
          });
          return divisionArr;
        }
      )
    );
  }

  //returns division information of provided division; divisionConcat
  getDivision(divisionName:string):Observable<any>{
    let url = '/division/get';
    let parameters = [{ 'division': divisionName}];
    return this.httpService.httpGet(url,parameters);
  }

  //
  getDivisionAny(divInfo: string): Observable<any> {
    let url = '/division/get/any';
    let parameters = [{ 'q': encodeURIComponent(divInfo) }];
    return this.httpService.httpGet(url, parameters);
  }

  constructor( private httpService:HttpServiceService) {

   }
}


  // getDivInfo(divisionName:string){
  //   let url = 'admin/getDivInfo'

  //   return this.http.get<any>(url + '?division=' + divisionName).pipe(
  //     map((res) => {
  //       return res.returnObject;
  //     }));
  // }
