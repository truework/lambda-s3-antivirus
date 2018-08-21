const AWS = require('aws-sdk');
const path = require('path');
const utils = require('./utils');
const av = require('./antivirus');

async function lambdaHandleEvent(event, context) {

    console.log(event);
    let jsonBody = JSON.parse(event.body);
    console.log(event.body);
    let s3ObjectKey = utils.extractKeyFromApiEvent(jsonBody);
    let s3ObjectBucket = utils.extractBucketFromApiEvent(jsonBody);

    await av.scanS3Object(s3ObjectKey, s3ObjectBucket);

}

module.exports = {
    lambdaHandleEvent: lambdaHandleEvent
};
