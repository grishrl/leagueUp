  const associateReplaysWorker = require('./server/workers/associate-replays');
  const grabTopStatsWorker = require('./server/workers/grab-top-stats');
  const groupMakerWorker = require('./server/workers/group-maker');
  const leagueStatRunnerWorker = require('./server/workers/league-fun-stat-runner');
  const readInVodsWorker = require('./server/workers/read-in-vods');
  const createStandingsTouchPoint = require('./server/workers/standings-touch-point');
  const tabulateTeamStatsWorker = require('./server/workers/tabulate-stats-team');
  const tabulateUserStatsWorker = require('./server/workers/tabulate-stats-user');
  const updateTeams = require('./server/workers/update-teams');
  const uploadToHeroesProfileWorker = require('./server/workers/upload-to-heroes-profile');

  const mongoose = require('mongoose');


  const worker = {};

  const workersList = {
      'true': runAll,
      'standings': createStandingsTouchPoint,
      'tabulateTeamStats': tabulateTeamStatsWorker,
      'tabulateUserStats': tabulateUserStatsWorker,
      'updateTeams': updateTeams,
      'associateReplays': associateReplaysWorker,
      'topStats': grabTopStatsWorker,
      'leagueStat': leagueStatRunnerWorker,
      'groupMaker': groupMakerWorker,
      'readInVods': readInVodsWorker,
      'heroesProfileUploader': uploadToHeroesProfileWorker
  }


  worker.init = function() {
      let workersState = process.env.runWorkers;

      //connect to mongo db
      mongoose.set('useUnifiedTopology', true);
      mongoose.set('useFindAndModify', false);
      mongoose.connect(process.env.mongoURI, {
          useNewUrlParser: true
      }, () => {
          console.log('connected to mongodb');
      });

      if (workersState == 'true') {

          runAll();

      } else if (
          workersState !== 'false' && workersState.length > 0
      ) {
          var workers = workersState.split(',');
          console.log('running specific workers,');
          workers.forEach((workerName) => {
              console.log('starting ', workerName), ' worker ';
              workersList[workerName]();
          });
      }
  }

  function runAll() {
      //once daily
      workersList.standings();
      workersList.tabulateTeamStats();
      workersList.tabulateUserStats();
      workersList.updateTeams();
      workersList.associateReplays();
      workersList.topStats();
      workersList.leagueStat();

      //once daily in off season
      if (process.env.groupMakerEnable == 'true') {
          workersList.groupMaker();
      }

      //hourly schedule
      workersList.readInVods();
      workersList.heroesProfileUploader();
  }

  module.exports = worker;