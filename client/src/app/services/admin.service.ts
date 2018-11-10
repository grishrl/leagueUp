import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http:HttpClient) { }

  queuePost(answer){
    let url='http://localhost:3000/admin/approveMemberAdd';

    return this.http.post(url, answer).pipe(
      map( res =>{
        return res['returnObject'];
      }));
  }

  deleteUser(user){
    let url ='http://localhost:3000/admin/delete/user';
    let payload = {displayName:user};
    return this.http.post(url, payload).pipe(
      map(
        res=>{
          return res;
        }
      )
    )
  }

  deleteTeam(team){
    let url = 'http://localhost:3000/admin/delete/team';
    team = team.toLowerCase();
    let payload = { teamName : team};
    return this.http.post(url, payload).pipe(
      map(
        res=>{
          return res;
        }
      )
    )
  }

  saveTeam(teamName, teamObj){
    let url = 'http://localhost:3000/admin/teamSave';
    let payload = {
      "teamName": teamName.toLowerCase(),
      "teamObj":teamObj
    }
    return this.http.post(url, payload).pipe(
      map( res => {
        return res['returnObject'];
      })
    )
  }

  changeCaptain(team, user){
    let url = 'http://localhost:3000/admin/reassignCaptain';
    let payload = { teamName: team, userName: user};
    return this.http.post(url, payload).pipe(
      map(
        res=>{
          return res['returnObject'];
        }
      )
    )
  }

  

}
