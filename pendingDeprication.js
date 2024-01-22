// router.get('/statistics', (req, res) => {
//     const path = '/team/statistics';
//     var id = decodeURIComponent(req.query.id);
//     Team.findOne({
//         teamName: id
//     }).then(
//         found => {
//             if (found) {
//                 let id = found._id.toString();
//                 Stats.find({
//                     associateId: id
//                 }).then(
//                     foundStats => {
//                         res.status(200).send(util.returnMessaging(path, 'Found stat', false, foundStats));
//                     },
//                     err => {
//                         res.status(400).send(util.returnMessaging(path, 'Error finding stats.', err, null, null));
//                     }
//                 )
//             } else {
//                 res.status(400).send(util.returnMessaging(path, 'User ID not found.', false, null, null));
//             }
//         },
//         err => {
//             res.status(400).send(util.returnMessaging(path, 'Error finding user.', err, null, null));
//         }
//     )
// });

// router.get('/statistics', (req, res) => {

//   const path = '/user/statistics';
//   var id = decodeURIComponent(req.query.id);

//   User.findOne({
//     displayName: id
//   }).then(
//     found => {
//       if (found) {
//         let id = found._id.toString();
//         Stats.find({
//           associateId: id
//         }).then(
//           foundStats => {
//             res.status(200).send(util.returnMessaging(path, 'Found stat', false, foundStats));
//           },
//           err => {
//             res.status(400).send(util.returnMessaging(path, 'Error finding stats.', err, null, null));
//           }
//         )
//       } else {
//         res.status(400).send(util.returnMessaging(path, 'User ID not found.', false, null, null, logObj));
//       }
//     },
//     err => {
//       res.status(400).send(util.returnMessaging(path, 'Error finding user.', err, null, null));
//     }
//   )


// });