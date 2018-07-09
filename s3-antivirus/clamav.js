const AWS = require('aws-sdk');
const fs = require('fs');
const execSync = require('child_process').execSync;
const path = require('path');
const constants = require('./constants');
const utils = require("./utils");

const S3 = new AWS.S3();

/**
 * Updates the definitions using freshclam.
 *
 * It will download the definitions to the current work dir.
 */
function updateAVDefinitonsWithFreshclam() {
    try {
        let executionResult = execSync(`${constants.PATH_TO_FRESHCLAM} --config-file=${constants.FRESHCLAM_CONFIG} --datadir=${constants.FRESHCLAM_WORK_DIR}`);
        
        utils.generateSystemMessage('Update message');
        console.log(executionResult.toString());

        if(executionResult.stderr) {
            utils.generateSystemMessage('stderr');
            console.log(executionResult.stderr.toString());
        }

        return true;
    } catch (err) {
        console.log(err);
        return false;
    }

}

/**
 * Download the Antivirus definition from S3.
 * The definitions are stored on the local disk, ensure there's enough space.
 */
async function downloadAVDefinitions() {

    const downloadPromises = constants.CLAMAV_DEFINITIONS_FILES.map((filenameToDownload) => {
       return new Promise((resolve, reject) => {
           let destinationFile = path.join('/tmp/', filenameToDownload);

           utils.generateSystemMessage(`Downloading ${filenameToDownload} from S3 to ${destinationFile}`);

           let localFileWriteStream = fs.createWriteStream(destinationFile);

           let options = {
               Bucket: constants.CLAMAV_BUCKET_NAME,
               Key   : `${constants.PATH_TO_AV_DEFINITIONS}/${filenameToDownload}`,
           };

           let s3ReadStream = S3.getObject(options).createReadStream().on('end', function () {
               utils.generateSystemMessage(`Finished download ${filenameToDownload}`);
               resolve();
           }).on('error', function (err) {
               utils.generateSystemMessage(`Error downloading definition file ${filenameToDownload}`);
               console.log(err);
               reject();
           });

           s3ReadStream.pipe(localFileWriteStream);
       });
    });

    return await Promise.all(downloadPromises);
}

/**
 * Uploads the AV definitions to the S3 bucket.
 */
async function uploadAVDefinitions() {

    const uploadPromises = constants.CLAMAV_DEFINITIONS_FILES.map((filenameToUpload) => {
        return new Promise((resolve, reject) => {
            utils.generateSystemMessage(`Uploading updated definitions for file ${filenameToUpload} ---`);

            let options = {
                Bucket: constants.CLAMAV_BUCKET_NAME,
                Key   : `${constants.PATH_TO_AV_DEFINITIONS}/${filenameToUpload}`,
                Body  : fs.createReadStream(path.join('/tmp/', filenameToUpload))
            };

            S3.putObject(options, function (err, data) {
                if (err) {
                    utils.generateSystemMessage(`--- Error uploading ${filenameToUpload} ---`);
                    console.log(err);
                    reject();
                    return;
                }
                resolve();
                utils.generateSystemMessage(`--- Finished uploading ${filenameToUpload} ---`);
            });

        });
    });

    return await Promise.all(uploadPromises);
}

/**
 * Function to scan the given file. This function requires ClamAV and the definitions to be available.
 * This function does not download the file so the file should also be accessible.
 *
 * Three possible case can happen:
 * - The file is clean, the clamAV command returns 0 and the function return "CLEAN"
 * - The file is infected, the clamAV command returns 1 and this function will return "INFECTED"
 * - Any other error and the function will return null; (falsey)
 *
 * @param pathToFile Path in the filesystem where the file is stored.
 */
function scanLocalFile(pathToFile) {
    try {
        let result = execSync(`${constants.PATH_TO_CLAMAV} -v -a --stdout -d /tmp/ '/tmp/download/${pathToFile}'`);

        utils.generateSystemMessage('SUCCESSFUL SCAN, FILE CLEAN');

        return constants.STATUS_CLEAN_FILE;
    } catch(err) {
        // Error status 1 means that the file is infected.
        if (err.status === 1) {
            utils.generateSystemMessage('SUCCESSFUL SCAN, FILE INFECTED');
            return constants.STATUS_INFECTED_FILE;
        } else {
            utils.generateSystemMessage('-- SCAN FAILED --');
            console.log(err);
            return constants.STATUS_ERROR_PROCESSING_FILE;
        }
    }
}

module.exports = {
    updateAVDefinitonsWithFreshclam: updateAVDefinitonsWithFreshclam,
    downloadAVDefinitions: downloadAVDefinitions,
    uploadAVDefinitions: uploadAVDefinitions,
    scanLocalFile: scanLocalFile
};