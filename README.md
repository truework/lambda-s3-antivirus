# Truework S3 Antivirus

Link to the Truework blog post for more details

https://blog.truework.com/2018-07-09-s3-antivirus-lambda-function/


## Building the Lambda function

```bash
chmod +x build_lambda.sh
./build_lambda.sh
```

The resulting file will be at

```bash
./lambda.zip
```

## Environment variables available

You can customize some of the variable used throughout the program to your needs.

**Mandatory variables:**

```
CLAMAV_BUCKET_NAME - Bucket where the definitions are stored
PATH_TO_AV_DEFINITIONS - Folder where the definitions are stored.
```

**Optional:**

```
STATUS_CLEAN_FILE - Value used to indicate that the file scanned was clean (default: CLEAN)
STATUS_INFECTED_FILE - Value used to indicate that the file scanned was infected (default: INFECTED)
STATUS_SKIPPED_FILE - Value used to indicate that the file could not be scanned.(default: SKIPPED)
STATUS_ERROR_PROCESSING_FILE - Value used to indicate that there was an error scanning the file (default: ERROR)
VIRUS_SCAN_STATUS_KEY - Key used to store the result of the virus scan (default: virusScanStatus)
VIRUS_SCAN_TIMESTAMP_KEY - Key used to store  (default: virusScanTimestamp)
MAX_FILE_SIZE - Value used to control the max size of a file that can be downloaded and scanned with out error. (default: 300MB)
```

### Additional information for Lambda configuration

clamscan and freshclam require sufficent resources - 1024MB is recommended for both.

S3 trigger should be configured via the lambda configuration and not via S3 events.

## Contributors

- [Jamie Lediet](https://github.com/jlediet)

#### License & Acknowledgements

The code is released under the Apache License 2.0, please find the details here:
https://www.apache.org/licenses/LICENSE-2.0

Thanks for the Upside travel team who provided a good blueprint in Python.

https://github.com/upsidetravel/bucket-antivirus-function/