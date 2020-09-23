// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  contentful:{
    spaceID:'b73d407c7z3q',
    token:'173bbb7627a7cdc82292e2a99d28d5004612fbc724a4e74a643629c67d98919f',
    categoryIDs:{
      news: '4bGp5zRaVOAmO2gaMuagEO',
      jumbotron: '28BCNlBF6Msggwa2ECkokm',
      showdown:'4ppO2xYoPHCmRmEGaQMFDF',
      nexusEdge:'dlyJJ9HDiQry7cjYFb6VX',
      podcast:'5tANSA3t3WNrFtzsCl5Wnp'
    }
  },
  s3bucketImages: 'dev-ngs-image-storage',
  s3bucketReplays: 'dev-ngs-replay-storage',
  s3bucketGeneralImage: 'dev-ngs-general-image',
  awsTld:"https://s3.amazonaws.com/",
  s3bucketArchiveImage: 'dev-ngs-archive-image',
  socketURL:'https://dev-ngs.herokuapp.com',
  heroesProfilePlayer: "https://www.heroesprofile.com/NGS/Profile/?",
  heroesProfile: "https://www.heroesprofile.com/Profile/?",
  heroesProfileTeam: "https://heroesprofile.com/NGS/Team/Single/?team=",
  season: 7,
  seasonStart: 1562572800000
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
