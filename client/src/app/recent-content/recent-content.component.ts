import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-recent-content',
  templateUrl: './recent-content.component.html',
  styleUrls: ['./recent-content.component.css']
})
export class RecentContentComponent implements OnInit {

  constructor(private http:HttpClient, private sanitizer:DomSanitizer) { }

  showdownItem = {
    'url':'',
    'snippet':{
      'resourceId':{
        'videoId':''
      }
    }
};
  edgeItem = {
    'url': '',
    'snippet': {
      'resourceId': {
        'videoId': ''
      }
    }
  };
  podcastItem = {
    'url': '',
    'snippet': {
      'resourceId': {
        'videoId': ''
      }
    }
  };

  createURL(item){
    if(item){
      let x = 'https://www.youtube.com/embed/' + item.snippet.resourceId.videoId;
      return x
    }

  }

  createPlaylistUrl(context) {
    let url;
    if(context){
      let videoId = context.snippet.resourceId.videoId;
      let playlistId = context.snippet.playlistId;
      url = 'https://www.youtube.com/watch?v=' + videoId + '&list=' + playlistId;
    }
    return url;
  }

  loaded = {
    showdown:false,
    edge:false,
    podcast:false
  };

  ngOnInit() {

    // let showdownPlaylistID = "PLCylT7hBfO1QeuiQil-GTE51yLadORZQ8";
    // let nexusEdegePlaylistID = 'PLCylT7hBfO1SIMocVH3UWqrCywkKrM8JM'
    // let podcastPlaylistID = 'PLCylT7hBfO1TfE4U-kdLMSvksc-nx4stD'

    // let showdownURL = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=' + showdownPlaylistID + '&key=AIzaSyD2eeQyVPBpeCIgytCPdie3jd6YAEzCUNc';
    // this.http.get(showdownURL).subscribe(
    //   res => {
    //     this.showdownItem = res['items'][0];
    //     this.showdownItem.url = this.createURL(this.showdownItem);
    //     this.loaded.showdown = true;
    //   },
    //   err => {
    //     console.log(err)
    //   }
    // )

    // let edgeURL = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=' + nexusEdegePlaylistID + '&key=AIzaSyD2eeQyVPBpeCIgytCPdie3jd6YAEzCUNc';
    // this.http.get(edgeURL).subscribe(
    //   res => {
    //     this.edgeItem = res['items'][0];
    //     this.edgeItem.url = this.createURL(this.edgeItem);
    //     this.loaded.edge = true;
    //   },
    //   err=>{
    //     console.log(err)
    //   }
    // )

    // let podcastURL = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=' + podcastPlaylistID + '&key=AIzaSyD2eeQyVPBpeCIgytCPdie3jd6YAEzCUNc';
    // this.http.get(podcastURL).subscribe(
    //   res => {
    //     this.podcastItem = res['items'][0];
    //     this.podcastItem.url = this.createURL(this.podcastItem);
    //     this.loaded.podcast = true;
    //   },
    //   err => {
    //     console.log(err)
    //   }
    // )
  }

}
