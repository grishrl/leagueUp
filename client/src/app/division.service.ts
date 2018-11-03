import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Team } from './classes/team.class';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DivisionService {
  url = 'http://localhost:3000/division/get';
  
  getDivision(divisionName:String, coastalDivision:String):Observable<any>{
    if(coastalDivision){
      // let query = '';
      // query+= this.url += '?division=' + divisionName;
      // query+='&coast='+coastalDivision;
      return this.http.get<any>(this.url+'?division='+divisionName+'&coast='+coastalDivision).pipe(
        map((res)=>{
          return res.returnObject;
        })
        // map(({ _id, teamName, lookingForMore, lfmDetails,
        //   teamMembers, pendingMembers, captain, teamMMRAvg,
        //   teamDivision }) => {
        //   console.log('xxx: ', _id, teamName, lookingForMore, lfmDetails,
        //     teamMembers, pendingMembers, captain, teamMMRAvg,
        //     teamDivision)
        //   return new Team(_id, teamName, lookingForMore, lfmDetails,
        //     teamMembers, pendingMembers, captain, teamMMRAvg,
        //     teamDivision);
        // })
      );
    }else{
      // let query = ''
      // query += this.url += '?division=' + divisionName;
      return this.http.get<any>(this.url+'?division=' + divisionName).pipe(
        map((res)=>{
          return res.returnObject;
        })
        // map(({ _id, teamName, lookingForMore, lfmDetails,
        //   teamMembers, pendingMembers, captain, teamMMRAvg,
        //   teamDivision }) => {
        //   console.log('xxx: ', _id, teamName, lookingForMore, lfmDetails,
        //     teamMembers, pendingMembers, captain, teamMMRAvg,
        //     teamDivision)
        //   return new Team(_id, teamName, lookingForMore, lfmDetails,
        //     teamMembers, pendingMembers, captain, teamMMRAvg,
        //     teamDivision);
        // })
      );
    }
  }

  constructor(private http: HttpClient) {

   }
}
