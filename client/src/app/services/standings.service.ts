import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StandingsService {

  getStandings(div){
    let url = 'standings/get/division';
    let payload = {
      division:div
    };
    console.log('payload ',payload)
    return this.http.post(url, payload).pipe(
      map(
        res => {
          console.log(res);
          return res['returnObject'];
        }
      )
    )
  }

  constructor(private http: HttpClient) { }
}
