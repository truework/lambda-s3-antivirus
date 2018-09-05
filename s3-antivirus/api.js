const AWS = require('aws-sdk');
const path = require('path');
const utils = require('./utils');
const av = require('./antivirus');
const constants = require('./constants');

async function lambdaHandleEvent(event, context) {

    let s3ObjectKey = utils.extractKeyFromApiEvent(event);
    let s3ObjectBucket = utils.extractBucketFromApiEvent(event);

    let virusScanStatus =
     await av.isS3FileTooBig(s3ObjectKey, s3ObjectBucket) ? constants.STATUS_SKIPPED_FILE : await av.scanS3Object(s3ObjectKey, s3ObjectBucket);

    return virusScanStatus;
}

module.exports = {
    lambdaHandleEvent: lambdaHandleEvent
};
