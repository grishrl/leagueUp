// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  contentful:{
    spaceID:'r32eicsr5ho2',
    token:'5467d9d1180f0a28a53c2a9cb0756269a5522db9f4319be10918695eb59e82cd',
    categoryIDs:{
      news: '4LLQW3MgwogACQUQ6q2esA',
      jumbotron: '1XdCWD3XK0i4a8OuSK62c2'
    }
  },
  s3bucketImages: 'test-ngs-image-storage',
  s3bucketReplays: 'test-ngs-replay-storage'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
