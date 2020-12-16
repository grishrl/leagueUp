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


  worker.init = function() {
      if (process.env.runWorkers == 'true') {
          //connect to mongo db
          mongoose.set('useUnifiedTopology', true);
          mongoose.set('useFindAndModify', false);
          mongoose.connect(process.env.mongoURI, {
              useNewUrlParser: true
          }, () => {
              console.log('connected to mongodb');
          });

          //once daily
          createStandingsTouchPoint();
          tabulateTeamStatsWorker();
          tabulateUserStatsWorker();
          updateTeams();
          associateReplaysWorker();
          grabTopStatsWorker();
          leagueStatRunnerWorker();

          //once daily in off season
          if (process.env.groupMakerEnable == 'true') {
              groupMakerWorker();
          }

          //hourly schedule
          readInVodsWorker();
          uploadToHeroesProfileWorker();

      }
  }

  module.exports = worker;