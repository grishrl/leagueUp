import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: "app-live-game-embedd",
  templateUrl: "./live-game-embedd.component.html",
  styleUrls: ["./live-game-embedd.component.css"]
})
export class LiveGameEmbeddComponent implements OnInit {
  constructor() {}

  @Input() match ;

  @ViewChild('iframeContainer') container:ElementRef;

  embedLink = "";
  ngOnInit(): void {

  }

  eleHeight;
  ngAfterViewInit(){
    // console.log(this.match);
            this.eleHeight =
              (this.container.nativeElement.offsetWidth / 16) * 9;
        let TLD = "twitch.tv/";
        let indexOf = this.match.casterUrl.toLowerCase().indexOf(TLD);
        if (indexOf >= 0) {
          let stop = TLD.length;
          let channelID = this.match.casterUrl.substring(
            indexOf + stop,
            this.match.casterUrl.length
          );
          this.embedLink = `https://player.twitch.tv/?channel=${channelID}&autoplay=false;&muted=true`;
          // console.log(this.embedLink);
        }


  }
}
