const fs = require('fs');
const axios = require('axios');
const path = require('path');
const AdmZip = require('adm-zip');
const AWS = require('aws-sdk');
const tmp = require('tmp-promise');
const LinvoDB = require('linvodb3');
const { uniq, startCase } = require('lodash');

const parsedReplaysBucket = process.env.s3bucketParsedReplays;
const statsBucket = process.env.s3bucketStats;

// Make the AWS SDK stop whining about V2 going into maintenance mode soon.
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

LinvoDB.defaults.store = { db: require('medeadown') };

const getS3 = () => {
    const accessKeyId = process.env.S3accessKeyId;
    const secretAccessKey = process.env.S3secretAccessKey;
    const region = process.env.S3region;

    // If we have credentials in the environment, use them.  If not, we
    // are either in lambda, or the developer has a profile set up.
    if (accessKeyId) {
        credentials = new AWS.Credentials({ accessKeyId, secretAccessKey });
        return new AWS.S3({ region, credentials });
    } else {
        return new AWS.S3();
    }
};

const openDatabase = path => {
    const db = {};

    db.matches = new LinvoDB(
        'matches',
        {},
        { filename: path + '/matches.ldb' }
    );
    db.parsedReplays = new LinvoDB(
        'parsedReplays',
        {},
        { filename: path + '/parsedReplays.ldb' }
    );
    db.heroData = new LinvoDB('heroData', {}, { filename: path + '/hero.ldb' });
    db.players = new LinvoDB(
        'players',
        {},
        { filename: path + '/players.ldb' }
    );
    db.settings = new LinvoDB(
        'settings',
        {},
        { filename: path + '/settings.ldb' }
    );

    db.matches.ensureIndex({ fieldName: 'map' });
    db.players.ensureIndex({ fieldName: 'hero' });

    return db;
};

const closeDatabase = async db => {
    await db.matches.store.close();
    await db.parsedReplays.store.close();
    await db.heroData.store.close();
    await db.players.store.close();
    await db.settings.store.close();
};

const createCollections = async (db, teams) => {
    const requiredCollections = uniq(teams.map(t => t.divisionDisplayName));

    for (const coastalDivision of requiredCollections.filter(d =>
        d.includes(' ')
    )) {
        requiredCollections.push(coastalDivision.split(' ')[0]);
    }

    requiredCollections.push('Non-Storm');

    const existingCollections = await new Promise((resolve, reject) => {
        db.settings.find({ type: 'collection' }, (err, collections) => {
            if (err) {
                reject(err);
            } else {
                resolve(collections);
            }
        });
    });

    const collectionMap = {};

    for (const existingCollection of existingCollections) {
        collectionMap[existingCollection.name] = existingCollection._id;
    }

    for (const collection of uniq(requiredCollections)) {
        if (!existingCollections.find(c => c.name === collection)) {
            await new Promise((resolve, reject) => {
                db.settings.insert(
                    { type: 'collection', name: collection },
                    (err, collection) => {
                        if (err) {
                            reject(err);
                        } else {
                            collectionMap[collection.name] = collection._id;
                            resolve(collection);
                        }
                    }
                );
            });
        }
    }

    return collectionMap;
};

const createTeams = async (db, requiredTeams) => {
    const existingTeams = await new Promise((resolve, reject) => {
        db.settings.find({ type: 'team' }, (err, foundTeams) => {
            if (err) {
                reject(err);
            } else {
                resolve(foundTeams);
            }
        });
    });

    const teamMap = {};

    for (const existingTeam of existingTeams) {
        teamMap[existingTeam.name] = {
            id: existingTeam._id,
            name: existingTeam.name,
            players: [],
        };
    }

    for (const requiredTeam of requiredTeams) {
        if (!existingTeams.find(t => t.name === requiredTeam.teamName)) {
            await new Promise((resolve, reject) => {
                db.settings.insert(
                    { type: 'team', name: requiredTeam.teamName, players: [] },
                    (err, createdTeam) => {
                        if (err) {
                            reject(err);
                        } else {
                            teamMap[createdTeam.name] = {
                                id: createdTeam._id,
                                name: requiredTeam.teamName,
                                players: [],
                            };
                            resolve(createdTeam);
                        }
                    }
                );
            });
        }

        // Add in all the rostered players.  If someone subbed for this team,
        // they will be added as we walk through the replays.
        const players = teamMap[requiredTeam.teamName].players;

        for (const teamMember of requiredTeam.teamMembers) {
            players.push(teamMember.displayName);
        }
    }

    return teamMap;
};

const findMatchingTeam = (homeTeam, awayTeam, players) => {
    let homeCount = 0;
    let awayCount = 0;

    for (const player of players) {
        if (homeTeam && homeTeam.players.includes(player)) {
            homeCount++;
        }

        if (awayTeam && awayTeam.players.includes(player)) {
            awayCount++;
        }
    }

    if (homeCount > 2 && homeCount > awayCount) {
        return homeTeam;
    } else if (awayCount > 2 && awayCount > homeCount) {
        return awayTeam;
    } else {
        // This can happen when a team withdraws
        return undefined;
    }
};

const insertReplay = async (db, match, filename, players, collections) => {
    if (!collections) {
        match.collection = [];
    } else {
        match.collection = collections;
    }

    const createdMatch = await new Promise((resolve, reject) => {
        db.matches.update(
            { map: match.map, date: match.date, type: match.type },
            match,
            { upsert: true },
            (err, numReplaced, newDoc) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(newDoc);
                }
            }
        );
    });

    await new Promise((resolve, reject) => {
        db.parsedReplays.insert({ _id: filename }, (err, inserted) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    if (createdMatch) {
        const playerArray = [];

        for (const i in players) {
            players[i].matchID = createdMatch._id;
            players[i].collection = createdMatch.collection;
            playerArray.push(players[i]);
        }

        await new Promise((resolve, reject) => {
            db.heroData.insert(playerArray, function (err, docs) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    return createdMatch ? createdMatch._id : undefined;
};

const alreadyProcessedReplay = async (db, filename) => {
    const wasFound = await new Promise((resolve, reject) => {
        db.parsedReplays.findOne({ _id: filename }, (err, found) => {
            if (err) {
                reject(err);
            } else {
                resolve(!!found);
            }
        });
    });

    return wasFound;
};

const updatePlayers = async (db, players) => {
    for (const i in players) {
        // Make sure all players are in the database.
        const playerDbEntry = {};
        playerDbEntry._id = players[i].ToonHandle;
        playerDbEntry.name = players[i].name;
        playerDbEntry.uuid = players[i].uuid;
        playerDbEntry.region = players[i].region;
        playerDbEntry.realm = players[i].realm;

        // This will ensure the most recent tag gets associated with each player.
        playerDbEntry.tag = players[i].tag;

        const updateEntry = { $set: playerDbEntry, $inc: { matches: 1 } };

        await new Promise((resolve, reject) => {
            db.players.update(
                { _id: playerDbEntry._id },
                updateEntry,
                { upsert: true },
                (err, numReplaced, upsert) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }
};

const getCollectionIdsForDivision = (collectionMap, divisionConcat) => {
    const collectionIds = [];

    if (divisionConcat) {
        const division = startCase(divisionConcat.replace('-', ' '));
        collectionIds.push(collectionMap[division]);

        if (division.includes(' ')) {
            collectionIds.push(collectionMap[division.split(' ')[0]]);
        }

        if (division !== 'Storm') {
            collectionIds.push(collectionMap['Non-Storm']);
        }
    }

    return collectionIds;
};

const streamToBuffer = async readableStream => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', data => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
};

const downloadJsonFromS3 = async (s3, bucket, key) => {
    const readStream = s3
        .getObject({
            Bucket: bucket,
            Key: key,
        })
        .createReadStream();

    const buffer = await streamToBuffer(readStream);

    return JSON.parse(buffer.toString('utf-8'));
};

const downloadAndExtractZipFromS3 = async (
    s3,
    zipFilename,
    fullZipPath,
    dbPath,
    currentSeason
) => {
    const writeStream = fs.createWriteStream(fullZipPath);

    try {
        const readStream = s3
            .getObject({
                Bucket: statsBucket,
                Key: `${currentSeason}/databases/${zipFilename}`,
            })
            .createReadStream();
        await new Promise((resolve, reject) => {
            readStream.on('error', err => reject(err));
            writeStream.on('error', err => reject(err));
            writeStream.on('finish', () => resolve());

            readStream.pipe(writeStream);
        });
    } catch (e) {
        if (e.code === 'NoSuchKey') {
            // This is OK, we just haven't created the database yet.
            console.log('No current database found in S3.');
            return;
        }

        throw e;
    } finally {
        writeStream.close();
    }

    console.log('Downloaded current database from S3.');

    const zip = new AdmZip(fullZipPath);
    await zip.extractAllTo(dbPath);
    console.log('Unzipped database.');
};

const publishZipToS3 = async (
    s3,
    fullZipPath,
    currentZipFilename,
    dailyZipFilename,
    dbDirectory,
    currentSeason
) => {
    const zip = new AdmZip();
    fs.writeFileSync(
        `${dbDirectory}/TIMESTAMP.TXT`,
        `Created from ${dailyZipFilename}.`
    );
    zip.addLocalFolder(dbDirectory, '', /^(?!.*(lock))/);
    zip.writeZip(fullZipPath);

    const readStream = fs.createReadStream(fullZipPath);

    await s3
        .upload({
            Bucket: statsBucket,
            Key: `${currentSeason}/databases/${dailyZipFilename}`,
            Body: readStream,
        })
        .promise();

    console.log(`Uploaded database to S3 as ${dailyZipFilename}.`);

    await s3
        .copyObject({
            Bucket: statsBucket,
            Key: `${currentSeason}/databases/${currentZipFilename}`,
            CopySource: `/${statsBucket}/${currentSeason}/databases/${dailyZipFilename}`,
        })
        .promise();

    console.log('Copied database to current.');
};

const scrubTempDirectory = async tempDirectory => {
    async function* walkFiles(dir) {
        for await (const d of await fs.promises.opendir(dir)) {
            const entry = path.join(dir, d.name);
            if (d.isDirectory()) yield* walkFiles(entry);
            else if (d.isFile()) yield entry;
        }
    }

    // Calling cleanup() fails, not sure why.  This works though.
    // We still end up with empty directories, for some reason
    // we can't delete those.  We should clean up every so often,
    // but at least we won't run the disk out of space.
    for await (const filepath of walkFiles(tempDirectory)) {
        try {
            console.log(`Deleting file ${filepath}.`);
            fs.unlinkSync(filepath);
        } catch (e) {
            console.log(`Unable to delete ${filepath}.`);
        }
    }
};

module.exports = async () => {
    const s3 = getS3();
    const { path: tempDirectory } = await tmp.dir({
        mode: 0o0700,
        prefix: 'ngs-stats',
        unsafeCleanup: true,
    });
    const currentSeason = await downloadJsonFromS3(
        s3,
        statsBucket,
        'currentSeason.json'
    );
    console.log(`Current season is ${currentSeason}.`);
    console.log(`Processing files using working directory ${tempDirectory}.`);
    const currentZipFilename = `NGS-season-${currentSeason}.zip`;
    const dailyZipFilename = `NGS-season-${currentSeason}-${new Date()
        .toISOString()
        .replace(/-/g, '_')
        .replace(/:/g, '_')}.zip`;
    const oldZipPath = `${tempDirectory}/stats-old.zip`;
    const newZipPath = `${tempDirectory}/stats-new.zip`;
    const dbPath = `${tempDirectory}/database`;
    fs.mkdirSync(dbPath);

    await downloadAndExtractZipFromS3(
        s3,
        currentZipFilename,
        oldZipPath,
        dbPath,
        currentSeason
    );

    const matches = await downloadJsonFromS3(
        s3,
        statsBucket,
        `${currentSeason}/matches.json`
    );
    console.log(`Found ${matches.length} matches.`);

    const teams = await downloadJsonFromS3(
        s3,
        statsBucket,
        `${currentSeason}/teams.json`
    );
    console.log(`Found ${teams.length} teams.`);

    const db = openDatabase(dbPath);

    const collectionMap = await createCollections(db, teams);
    const teamMap = await createTeams(db, teams);
    const playerMap = {};
    const playersForTeamMap = {};

    for (const teamName in teamMap) {
        playersForTeamMap[teamName] = [];
    }

    let gameCount = 0;

    for (const match of matches) {
        if (match.replays) {
            for (const i in match.replays) {
                if (i === '_id') {
                    continue;
                }

                const filename = match.replays[i].url;
                const gameId = match.replays[i].data;

                if (!filename || !gameId) {
                    // This replay doesn't have a filename or an ID.  This should not happen.
                    continue;
                }

                if (await alreadyProcessedReplay(db, filename)) {
                    continue;
                }

                console.log(`Importing ${filename}.`);
                let parsedReplay = undefined;

                try {
                    parsedReplay = await downloadJsonFromS3(
                        s3,
                        parsedReplaysBucket,
                        `${currentSeason}/parsedReplays/${gameId}.json`
                    );
                } catch (e) {
                    console.log(
                        `Unable to download parsed replay ${gameId} for ${filename} from S3, skipping.`
                    );
                    console.log(`Error: ${e}`);
                    continue;
                }

                const { match: replay, players, status } = parsedReplay;

                const bluePlayers = [];
                const redPlayers = [];

                for (const toonHandle in players) {
                    const player = players[toonHandle];
                    const tag = `${player.name}#${player.tag}`;

                    if (player.team === 0) {
                        bluePlayers.push(tag);
                    } else {
                        redPlayers.push(tag);
                    }
                }

                const homeTeam = teamMap[match.home.teamName];
                const awayTeam = teamMap[match.away.teamName];

                const blueTeam = findMatchingTeam(
                    homeTeam,
                    awayTeam,
                    bluePlayers
                );
                const redTeam = findMatchingTeam(
                    homeTeam,
                    awayTeam,
                    redPlayers
                );

                // If a team has withdrawn, we won't find it, so don't try to
                // find ORS that need to be added.
                if (blueTeam) {
                    for (const bluePlayer of bluePlayers) {
                        if (!blueTeam.players.includes(bluePlayer)) {
                            blueTeam.players.push(bluePlayer);
                            console.log(
                                `Adding ORS ${bluePlayer} to ${blueTeam.name}.`
                            );
                        }
                    }
                }

                if (redTeam) {
                    for (const redPlayer of redPlayers) {
                        if (!redTeam.players.includes(redPlayer)) {
                            redTeam.players.push(redPlayer);
                            console.log(
                                `Adding ORS ${redPlayer} to ${redTeam.name}.`
                            );
                        }
                    }
                }

                for (const playerID in players) {
                    const fullTag = `${players[playerID].name}#${players[playerID].tag}`;
                    playerMap[fullTag] = playerID;
                }

                if (status === 1) {
                    const collectionIds = getCollectionIdsForDivision(
                        collectionMap,
                        match.divisionConcat
                    );
                    const matchID = await insertReplay(
                        db,
                        replay,
                        filename,
                        players,
                        collectionIds
                    );

                    if (matchID) {
                        await updatePlayers(db, players);
                        gameCount++;
                    } else {
                        console.log(
                            `Skipped ${localFile}, status is ${status}.`
                        );
                    }
                }
            }
        }
    }

    for (const team of teams) {
        const toonHandles = [];

        for (const playerTag of teamMap[team.teamName].players) {
            if (playerMap[playerTag]) {
                // We can only add players that we saw in a replay,
                // since we need their toon handle.
                toonHandles.push(playerMap[playerTag]);
            }
        }

        for (const toonHandle of toonHandles) {
            await new Promise((resolve, reject) => {
                db.settings.update(
                    { _id: teamMap[team.teamName].id },
                    { $addToSet: { players: toonHandle } },
                    {},
                    (err, replaced, updatedDoc) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        }
    }

    await closeDatabase(db);

    if (gameCount == 0) {
        console.log(
            'No new games were processed, skipping upload of database.'
        );

        return;
    }

    await publishZipToS3(
        s3,
        newZipPath,
        currentZipFilename,
        dailyZipFilename,
        dbPath,
        currentSeason
    );

    // We probably don't need to do this in a lambda, but we might be running on
    // a developer's machine, so keep it tidy.
    await scrubTempDirectory(tempDirectory);
};
