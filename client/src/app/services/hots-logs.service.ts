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
         console.log('res from hotslogs', res);
         if (res.hasOwnProperty('LeaderboardRankings')){
           var inc = 0
           var totalMMR = 0;
           res['LeaderboardRankings'].forEach(element => {
             console.log('element ',element);
             if (element['GameMode'] != 'QuickMatch'){
               if (element['CurrentMMR']>0){
                console.log('inc ', inc, ' totalMMR ', totalMMR);
                inc+=1;
                totalMMR += element.CurrentMMR;
              }
             }
           });
           return Math.round(totalMMR/inc);
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

   validCheck(url):Observable<any>{
     console.log('a')
     let playerId = '';
     if (url.indexOf('https://www.hotslogs.com/Player/Profile?PlayerID=') > -1) {
       playerId = url.slice(url.indexOf("=") + 1, url.length);
     }
     let callUrl = this.url.replace('?id', playerId);
     return this.http.get(callUrl);
   }
}
