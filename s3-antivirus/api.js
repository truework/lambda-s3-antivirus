const AWS = require('aws-sdk');
const path = require('path');
const utils = require('./utils');
const av = require('./antivirus');

async function lambdaHandleEvent(event, context) {

    let jsonBody = JSON.parse(event.body);

    let s3ObjectKey = utils.extractKeyFromApiEvent(jsonBody);
    let s3ObjectBucket = utils.extractBucketFromApiEvent(jsonBody);

    let virusScanStatus = await av.scanS3Object(s3ObjectKey, s3ObjectBucket);

    return virusScanStatus;
}

module.exports = {
    lambdaHandleEvent: lambdaHandleEvent
};
