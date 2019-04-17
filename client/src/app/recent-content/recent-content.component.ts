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

  showdownItem;
  edgeItem;
  podcastItem;

  createURL(item){
    if(item){
      let x = 'https://www.youtube.com/embed/' + item.snippet.resourceId.videoId;
      console.log(x);
      return x
    }

  }

  ngOnInit() {

    let showdownPlaylistID = 'PLCylT7hBfO1TMCpCxcFVB_n7wZUXU2dKu'
    let nexusEdegePlaylistID = 'PLCylT7hBfO1SIMocVH3UWqrCywkKrM8JM'
    let podcastPlaylistID = 'PLCylT7hBfO1TfE4U-kdLMSvksc-nx4stD'

    let showdownURL = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=' + showdownPlaylistID + '&key=AIzaSyD2eeQyVPBpeCIgytCPdie3jd6YAEzCUNc';
    this.http.get(showdownURL).subscribe(
      res => {
        this.showdownItem = res['items'][0];
        this.showdownItem.url = this.createURL(this.showdownItem);
        console.log('this.showdownItem ', this.showdownItem)
      }
    )

    let edgeURL = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=' + nexusEdegePlaylistID + '&key=AIzaSyD2eeQyVPBpeCIgytCPdie3jd6YAEzCUNc';
    this.http.get(edgeURL).subscribe(
      res => {
        this.edgeItem = res['items'][0];
        this.edgeItem.url = this.createURL(this.edgeItem);
        console.log('this.edgeItem ', this.edgeItem)
      }
    )

    let podcastURL = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=' + podcastPlaylistID + '&key=AIzaSyD2eeQyVPBpeCIgytCPdie3jd6YAEzCUNc';
    this.http.get(podcastURL).subscribe(
      res => {
        this.podcastItem = res['items'][0];
        this.podcastItem.url = this.createURL(this.podcastItem);
        console.log('this.podcastItem ', this.podcastItem)
      }
    )
  }

}
