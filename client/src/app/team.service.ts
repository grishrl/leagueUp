import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Team } from './classes/team.class';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  getTeam(name):Observable<any>{
    let encodededID = encodeURIComponent(this.realTeamName(name));
    let url = 'http://localhost:3000/team/get?team='+encodededID;
    return this.http.get<any>(url)
    .pipe(
      map((res)=>{
        let logoURL = res.returnObject.logo;
        console.log('logoUrl', logoURL);
      res.returnObject.logo = this.cleanUpLogoUrl(logoURL);
       return res.returnObject;
      }
      // ({ _id, teamName, lookingForMore, lfmDetails,
      //   teamMembers, pendingMembers, captain, teamMMRAvg,
      //   teamDivision }) => {
      //   return new Team(_id, teamName, lookingForMore, lfmDetails,
      //     teamMembers, pendingMembers, captain, teamMMRAvg,
      //     teamDivision);
      // }
      )
    );
  };

  saveTeam(team): Observable<any>{
    let url = 'http://localhost:3000/team/save';
    return this.http.post<any>(url, team).pipe(
      map( (res)=>{
        return res;
      })
    );
  }

  addUser(user, team){
    let postData = {}
    if(typeof user!='object'){
      postData['teamName'] = team;
      postData['addMember']= user;
    }else{
      postData = user;
    }
    let url = 'http://localhost:3000/team/addMember';
    return this.http.post<any>(url, postData);

  }

  cleanUpLogoUrl(url):string{
    let index = url.indexOf('assets');
    let clean = url.slice(index, url.length);
    return clean;
  }

  routeFriendlyTeamName(teamname):string{
    var pattern = ' ';
    var re = new RegExp(pattern, "g");
    if(teamname!=null&&teamname!=undefined){
      return teamname.replace(re, '_');
    }else{
      return '';
    }
  }

  realTeamName(teamname):string{
    var pattern = '_';
    var re = new RegExp(pattern, "g");
    if (teamname != null && teamname != undefined) {
      return teamname.replace(re, ' ');
    }else{
      return '';
    }
    
  }

  constructor(private http: HttpClient) { }
}
