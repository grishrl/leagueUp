import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket;
  constructor() {
    this.socket = webSocket("ws://localhost:5000");
    this.socket.subscribe((res) => {

    });
  }

    send(msg){
      this.socket.next({message: msg});
    }

    disconnectSocket(){

      this.socket.complete();
    }

    ngOnDestroy(){
      this.socket.complete();
    }
}
