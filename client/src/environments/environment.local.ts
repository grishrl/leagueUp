// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  s3bucketImages: "dev-ngs-image-storage",
  s3bucketReplays: "dev-ngs-replay-storage",
  s3bucketGeneralImage: "dev-ngs-general-image",
  s3bucketArchiveImage: "dev-ngs-archive-image",
  s3bucketRankVerification: "dev-ngs-general-image/player-ranks-images",
  s3bucketStats: "dev-ngs-stats-of-the-storm",
  s3folderStats: "databases",
  s3regionStats: "us-east-1",
  awsTld: "https://s3.amazonaws.com/",
  socketURL: "localhost:5000",
  heroesProfilePlayer: "https://www.heroesprofile.com/NGS/Profile/?",
  heroesProfile: "https://www.heroesprofile.com/Profile/?",
  heroesProfileTeam: "https://heroesprofile.com/NGS/Team/Single/?team=",
  serverTLD:''
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
