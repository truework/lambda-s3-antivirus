/**
 * Lambda function that will be perform the scan and tag the file accordingly.
 */

const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const clamav = require('./clamav');
const s3 = new AWS.S3();
const utils = require('./utils');
const constants = require('./constants');

function downloadFileFromS3(s3ObjectKey, s3ObjectBucket) {
    const downloadDir = `/tmp/download`;
    if (!fs.existsSync(downloadDir)){
        fs.mkdirSync(downloadDir);
    }
    let localPath = `${downloadDir}/${path.basename(s3ObjectKey)}`;

    let writeStream = fs.createWriteStream(localPath);

    utils.generateSystemMessage(`Downloading file s3://${s3ObjectBucket}/${s3ObjectKey}`);

    let options = {
        Bucket: s3ObjectBucket,
        Key   : s3ObjectKey,
    };

    return new Promise((resolve, reject) => {
        s3.getObject(options).createReadStream().on('end', function () {
            utils.generateSystemMessage(`Finished downloading new object ${s3ObjectKey}`);
            resolve();
        }).on('error', function (err) {
            console.log(err);
            reject();
        }).pipe(writeStream);
    });
}


async function lambdaHandleEvent(event, context) {

    let s3ObjectKey = utils.extractKeyFromS3Event(event);
    let s3ObjectBucket = utils.extractBucketFromS3Event(event);

    await clamav.downloadAVDefinitions(constants.CLAMAV_BUCKET_NAME, constants.PATH_TO_AV_DEFINITIONS);

    await downloadFileFromS3(s3ObjectKey, s3ObjectBucket);

    let virusScanStatus = clamav.scanLocalFile(path.basename(s3ObjectKey));

    var taggingParams = {
        Bucket: s3ObjectBucket,
        Key: s3ObjectKey,
        Tagging: utils.generateTagSet(virusScanStatus)
    };

    try {
        let uploadResult = await s3.putObjectTagging(taggingParams).promise();
        utils.generateSystemMessage("Tagging successful");
    } catch(err) {
        console.log(err);
    } finally {
        return virusScanStatus;
    }
}

module.exports = {
    lambdaHandleEvent: lambdaHandleEvent
};

