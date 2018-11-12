import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http:HttpClient) { }

  getTeamsNotDivisioned(){
    let url = 'http://localhost:3000/admin/getTeamsUndivisioned';
    return this.http.get(url).pipe(
      map( 
        res=>{ 
          return res['returnObject'];
         }
      )
    )
  }


  saveDivisionEdits(divname, divobj){
  let url = "http://localhost:3000/admin/upsertDivision";
  let payload = {
    "divObj": divobj,
    "divName":divname
  };
  return this.http.post(url, payload).pipe(
    map( res=>{
      return res['returnObject'];
    })
  )
  }

  divisionTeam( teamArr, divisionName){
    let url ="http://localhost:3000/admin/divisionTeams";
    let payload = {
      teamInfo:teamArr,
      divisionName:divisionName
    };
    return this.http.post(url, payload).pipe(
      map(
        res=>{
          return res['returnObject'];
        }
      )
    )
  }

  removeTeams(teamArr, divName){
    let url = 'http://localhost:3000/admin/removeTeams';
    let payload = {
      "teams":teamArr,
      "divName":divName
    }
    return this.http.post(url, payload).pipe(
      map(
        res=>{
          return res['returnObject'];
        }
      )
    )
  }

  getDivisionList(){
    let url = 'http://localhost:3000/admin/getDivisionInfo';
    return this.http.get(url).pipe(
      map(res=>{
        let divisionArr = res['returnObject'];
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
      })
    )
  }

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
