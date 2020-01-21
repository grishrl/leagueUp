import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotsLogsService {


  private url = 'https://api.hotslogs.com/Public/Players/?id';
  constructor(private http: HttpClient) {
   }

   getMMR(playerId):Observable<any>{
     if (playerId.indexOf('https://www.hotslogs.com/Player/Profile?PlayerID=')>-1){
      playerId = playerId.slice(playerId.indexOf("=")+1, playerId.length);
     }
     let callUrl = this.url.replace('?id', playerId);
     return this.http.get(callUrl).pipe(
       map( res => {
         if (res.hasOwnProperty('LeaderboardRankings')){
           var inc = 0
           var totalMMR = 0;
           res['LeaderboardRankings'].forEach(element => {
             if (element['GameMode'] != 'QuickMatch'){
               if (element['CurrentMMR']>0){
                inc+=1;
                totalMMR += element.CurrentMMR;
              }
             }
           });
           return {avgMMR:Math.round(totalMMR/inc),PlayerID:res['PlayerID']};
         }else{
           if( res.hasOwnProperty('Message') ){
             if(res['Message'].indexOf('invalid') > -1){
               return 'error';
             }
           }
         }
       })
     )
   }




   getMMRdisplayName(displayName){
     let url = 'https://api.hotslogs.com/Public/Players/1/';
     url += displayName;
     return this.http.get(url).pipe(
       map(data => {
         let val = 0;
     if (data.hasOwnProperty('LeaderboardRankings')) {
         let sl = data['LeaderboardRankings']['StormLeague']['CurrentMMR'] ? data['LeaderboardRankings']['StormLeague']['CurrentMMR'] : 0;
         let ur = data['LeaderboardRankings']['UnrankedDraft']['CurrentMMR'] ? data['LeaderboardRankings']['UnrankedDraft']['CurrentMMR'] : 0;
         val = sl * .6 + ur * .4;
         val = Math.round(val);
         return val;
       } else {
           if(data.hasOwnProperty('Message')) {
         if(data['Message'].indexOf('invalid') > -1) {
      return 'error';
    }
  }
}
       })
     )
   }


  returnProfileLink(playerID) {
    let url = 'https://www.hotslogs.com/Player/Profile?PlayerID=';
    return url += playerID;
  }

   validCheck(url):Observable<any>{
     let playerId = '';
     if (url.indexOf('https://www.hotslogs.com/Player/Profile?PlayerID=') > -1) {
       playerId = url.slice(url.indexOf("=") + 1, url.length);
     }
     let callUrl = this.url.replace('?id', playerId);
     return this.http.get(callUrl);
   }
}
