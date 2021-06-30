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

  }

}
