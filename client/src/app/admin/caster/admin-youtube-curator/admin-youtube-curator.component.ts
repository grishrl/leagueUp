import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DivisionService } from 'src/app/services/division.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TimeserviceService } from 'src/app/services/timeservice.service';
import { find } from 'lodash';
import { UtilitiesService } from 'src/app/services/utilities.service';

declare var gapi: any;

@Component({
  selector: 'app-admin-youtube-curator',
  templateUrl: './admin-youtube-curator.component.html',
  styleUrls: ['./admin-youtube-curator.component.css']
})
export class AdminYoutubeCurator implements OnInit {

  google_oauth_id;
  google_api_key;
  constructor(private DivisionService: DivisionService, private UtilityService:UtilitiesService, private ScheduleService: ScheduleService, private timeService: TimeserviceService, private cd: ChangeDetectorRef) {
    this.UtilityService.getYtO().subscribe(
      res=>{
        this.google_oauth_id = res.oauth_key;
        this.google_api_key = res.api_key;
      }
    )
   }

  divisionInfo;
  reports;
  seasonValue;
  totalVideos = 0;

  async ngOnInit(){

  }

  async ngAfterViewInit() {

    this.timeService.getSesasonInfo().subscribe(
      res => {
        this.seasonValue = res['value'];
        console.warn(this.seasonValue);
      }
    )

    this.DivisionService.getDivisionInfo().subscribe(
      res => {
        this.divisionInfo = res;
        console.log(this.divisionInfo);
      },
      err => {
        console.warn('error getting division info')
      }
    )

    this.ScheduleService.getUncurratedReport().subscribe(
      res => {
        this.reports = res;
        console.log(this.reports);
        this.reports.reportList.forEach(
          r=>{
            this.totalVideos += r.vodLinks.length;
          }
        )
      },
      err => {
        console.warn('error getting reports');
      }
    )

    gapi.load('client:auth2',  ()=>{
      console.log('initial gapi load.' , 'oauth id', this.google_oauth_id);
      gapi.auth2.init({ client_id: this.google_oauth_id })
    });

    if (await this.checkIfUserAuthenticated()) {
      this.user = this.authInstance.currentUser.get();
    }



  }

  gapiInstance;
  gapiSetup;
  authInstance;
  error;
  user;
  playlistAdded=0;
  errorCount=0;
  hideWorking = true;

  async initGoogleAuth(): Promise<void> {
    //  Create a new Promise where the resolve
    // function is the callback passed to gapi.load
    const pload = new Promise((resolve) => {
      gapi.load('client:auth2', resolve);
    });

    // When the first promise resolves, it means we have gapi
    // loaded and that we can call gapi.init
    return pload.then(async () => {
      await gapi.auth2
        .init({ client_id: this.google_oauth_id })
        .then(auth => {
          this.gapiInstance = gapi;
          this.gapiSetup = true;
          this.authInstance = auth;
        });
    });
  }

  async authenticate(): Promise<gapi.auth2.GoogleUser> {
    // Initialize gapi if not done yet
    if (!this.gapiSetup) {
      await this.initGoogleAuth();
    }

    // Resolve or reject signin Promise
    return new Promise(async () => {
      await this.authInstance.signIn({

        scope: "https://www.googleapis.com/auth/youtube.force-ssl"
      }).then(
        user => { this.user = user; this.loadClient().then(()=>{
          this.disableYoutubeButton = false;
          // like scope apply, rendering wasnt occuring because of the wrapped promises (all this takes place outside of Angulars view).
          this.cd.detectChanges();
        }); },
        error => this.error = error);
    });
  }

  loadClient() {
    gapi.client.setApiKey(this.google_api_key);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
      .then(function () {
        console.log("GAPI client loaded for API");
      },
        function (err) {
          console.error("Error loading GAPI client for API", err);
        });
  }

  playlistList = [];

  async youtube() {
    this.hideWorking = false;
    this.playlistList = [];
    this.parsedList = [];
    this.recursePlaylist(undefined);

  }

  async recursePlaylist(npt) {

    let results = await this.getPlaylistInfo(npt);
    console.log(npt);
    console.log(results);
    confirm('halting');
    if (results.items) {
      this.playlistList = this.playlistList.concat(results.items);
      console.log('concating..', this.playlistList);
    }
    if (results.nextPageToken) {
      this.recursePlaylist(results.nextPageToken)
    } else {
      console.log('might be done', this.playlistList);
      this.parseList();
    }
  }

  //ngs channel id : UCnfohSTrlMyqiCwI5-3jXmw
  //ngs web channel id : UCOf6CO75ePUy5Q5lCthv2Jg
  getPlaylistInfo(nextPageToken) {
    console.log('nextPageToken', nextPageToken);
    const request = {
      "part": [
        "snippet, contentDetails"
      ],
      "channelId": "UCOf6CO75ePUy5Q5lCthv2Jg",
      "maxResults": 50
    }
    if (nextPageToken) {
      request['pageToken'] = nextPageToken;
    }
    return gapi.client.youtube.playlists.list(request)
      .then(function (response) {
        // Handle the results here (response.result has the parsed body).
        // console.log("Response", response.result);
        return response.result;
      },
        function (err) {
          throw err;
        })
  }

  parsedList = [];

  parseList() {
    this.playlistList.forEach(
      playlist => {
        console.log(playlist);
        let obj = {};
        obj['id'] = playlist.id;
        obj['etag'] = playlist.etag;
        obj['kind'] = playlist.kind;
        obj['title'] = playlist.snippet.localized.title;
        this.parsedList.push(obj);
      }
    )
    console.log('parsed youtube lists', this.parsedList);
    this.currateList();
  }

  playlistaddarr = [];

  deferredInserts = [];

  currateList() {

    let tracked = {};

    this.reports.reportList.forEach(report => {
      let reportDiv = report.division;
      let divInf = find(this.divisionInfo, { divisionConcat: reportDiv });
      let playListName = `Season ${this.seasonValue} ${divInf.displayName}`;
      let youtubeplaylist = find(this.parsedList, { title: playListName });
      report.vodLinks.forEach(link => {
        let id = this.returnId(link);
        if (id) {
          if (youtubeplaylist) {
            this.insertVidToList(youtubeplaylist.id, id);
          } else if (!tracked[playListName]) {
            tracked[playListName] = true;
            this.createPlaylist(playListName);
            this.deferredInserts.push({ playListName, id });
          }else if(tracked[playListName]){
            this.deferredInserts.push({ playListName, id });
          }
        }
      });
    });

    if (Object.keys(tracked).length > 0) {
      Promise.all(this.createPlaylistArr).then(
        res => {
          let responseResults = [];
          res.forEach(iter=>{
            responseResults.push(iter.result);
          })
          responseResults.forEach(
            insertedList => {
              let obj = {};
              obj['id'] = insertedList.id;
              obj['etag'] = insertedList.etag;
              obj['kind'] = insertedList.kind;
              obj['title'] = insertedList.snippet.localized.title;
              this.parsedList.push(obj);
            }
          );
          this.deferredInserts.forEach(
            defIns => {
              console.log('deffered insert defIns', defIns);
              console.log('parsedList', this.parsedList);
              let youtubeplaylist = find(this.parsedList, { title: defIns.playListName });
              this.insertVidToList(youtubeplaylist.id, defIns.id);
            });
          if(this.playlistaddarr.length>0){
            this.insertVideos();
          }
        },
        err => {
          console.warn('play list insert failure', err);
        }
      )
    } else {
      this.insertVideos();

    }

  }

  async insertVideos(){

    let results = [];
    let errorArray = [];
    let successArray = [];

    for(var i = 0; i<this.playlistaddarr.length; i++){
      let request = this.playlistaddarr[i];
      console.log('request', request);
      try{
        let r = await gapi.client.youtube.playlistItems.insert(request);
        results.push(r);
        this.playlistAdded +=1;
      }catch(e){
        console.log(e);
        this.errorCount += 1;
      }
    }

    this.reports.reportList.forEach(
      r=>{
        r.playlistCurrated = true;
      }
    );

    this.ScheduleService.casterReport(this.reports.reportList).subscribe(
      r=>{
        console.log('success', r);
      },
      e=>{
        console.warn(e);
      }
    )

    this.hideWorking = true;

  }

  returnId(str) {
    let id = null;
    if (str.includes('tu.be')) {
      id = str.substring('https://youtu.be/'.length, str.length);
    } else if (str.includes('youtube.com')) {
      let ind = str.indexOf('=');
      id = str.substring(ind + 1, str.length);
    }
    return id;
  }

  insertVidToList(playlistId, vidId) {
    let request = {
      "part": [
        "snippet"
      ],
      "resource": {
        "snippet": {
          "playlistId": playlistId,
          "resourceId": {
            "kind": "youtube#video",
            "videoId": vidId
          }
        }
      }
    };

    this.playlistaddarr.push(request);
  }

  createPlaylistArr = [];

  createPlaylist(title) {
    let request = {
      "part": [
        "snippet,status"
      ],
      "resource": {
        "snippet": {
          "title": title
        },
        "status": {
            "privacyStatus": "public"
          }
      }
    }
    let prom = gapi.client.youtube.playlists.insert(request);
    this.createPlaylistArr.push(prom);
  }

  disableYoutubeButton = true;


  async checkIfUserAuthenticated(): Promise<boolean> {
    // Initialize gapi if not done yet
    if (!this.gapiSetup) {
      await this.initGoogleAuth();
    }

    return this.authInstance.isSignedIn.get();
  }

}