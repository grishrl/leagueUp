import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Team } from '../classes/team.class';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DivisionService {

  cachedDivisions
  // url = 'http://localhost:3000/division/get';
  url = 'division/get';

  getDivisionInfo(){

    // let turl = 'http://localhost:3000/admin/getDivisionInfo';
    let turl = 'admin/getDivisionInfo';
    return this.http.get(turl).pipe(
      map(
        res=>{ 
          let divisionArr =  res['returnObject'];
          divisionArr.sort((a,b)=>{
            if(a.sorting<b.sorting){
              return -1;
            }
            if(a.sorting > b.sorting){
              return 1
            }
            return 0;
          });
          this.cachedDivisions = divisionArr;
          return divisionArr;
        }
      )
    )
  }

  getDivInfo(divisionName){
    // let url = 'http://localhost:3000/admin/getDivInfo'
    let url = 'admin/getDivInfo'

    return this.http.get<any>(this.url + '?division=' + divisionName).pipe(
      map((res) => {
        return res.returnObject;
      })); 
  }
  
  getDivision(divisionName:string):Observable<any>{

    return this.http.get<any>(this.url+'?division='+divisionName).pipe(
        map((res)=>{
          return res.returnObject;
        }));
  }

  constructor(private http: HttpClient) {

   }
}
