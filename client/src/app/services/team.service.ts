import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  getTeam(name):Observable<any>{
    let encodededID = encodeURIComponent(this.realTeamName(name));
    // let url = 'http://localhost:3000/team/get?team='+encodededID;
    let url = 'team/get?team=' + encodededID;
    return this.http.get<any>(url)
    .pipe(
      map((res)=>{
       return res.returnObject;
      }
      )
    );
  };

  getTeams(names){
    // let url = 'http://localhost:3000/team/getTeams';
    let url = 'team/getTeams';
    let payload = {teams:names}
    return this.http.post(url, payload).pipe(
      map(
        res=>{
          return res['returnObject'];
        }
      )
    )
  }

  changeCaptain(team, user){
    // let url = 'http://localhost:3000/team/reassignCaptain';
    let url = 'team/reassignCaptain';
    team = team.toLowerCase();
    let payload = {
      teamName: team,
      username:user
    }
    return this.http.post(url, payload).pipe(
      map( res=>{
        return res['returnObject'];
      })
    )
  }

  deleteTeam(team){
    // let url = 'http://localhost:3000/team/delete';
    let url = 'team/delete';
    team = team.toLowerCase();
    let payload = {teamName:team};
    return this.http.post(url, payload).pipe(
      map( res =>{
        return res['returnObject'];
      })
    )
  }

  teamSearch(team){
    // let url = 'http://localhost:3000/search/team';
    let url = 'search/team';
    team = team.toLowerCase();
    let payload = {teamName:team};
    return this.http.post(url, payload).pipe(
      map( res=>{
        return res['returnObject'];
      })
    )
  }

  createTeam(team){
    // let url = 'http://localhost:3000/team/create';
    let url = 'team/create';
    return this.http.post<any>(url, team).pipe(
      map( res=>{
        return res.returnObject;
      } )
    )
  }

  saveTeam(team): Observable<any>{
    // let url = 'http://localhost:3000/team/save';
    let url = 'team/save';
    return this.http.post<any>(url, team).pipe(
      map( (res)=>{
        return res;
      })
    );
  }

  removeUser(user, team){
    let url = '/team/removeMember';
    let payload = {
      remove: user,
      teamName: team
    }
    return this.http.post<any>(url, payload).pipe(
      map((res) => {
        return res;
      })
    )
  }

  addUser(user, team){
    let postData = {}
    if(typeof user!='object'){
      postData['teamName'] = team;
      postData['addMember']= user;
    }else{
      postData = user;
    }
    // let url = 'http://localhost:3000/team/addMember';
    let url = 'team/addMember';
    return this.http.post<any>(url, postData);

  }

  // cleanUpLogoUrl(url):string{
  //   if(url != null && url != undefined){
  //     let index = url.indexOf('assets');
  //     let clean = url.slice(index, url.length);
  //     return clean;
  //   }else{
  //     return '';
  //   }
  // }

  imageFQDN(img) {
    let imgFQDN = 'https://s3.amazonaws.com/' + environment.s3bucketImages + '/';
    return imgFQDN += img;
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
