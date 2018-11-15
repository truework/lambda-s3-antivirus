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
MAX_FILE_SIZE - Value used to control the max size of a file that can be downloaded and scanned without error. (default: 300MB)
```

### Additional information for Lambda configuration

clamscan and freshclam require sufficent resources - 1024MB is recommended for both.

S3 trigger should be configured via the lambda configuration and not via S3 events.

### Set up and utilize invokable lambda endpoint

1. Build the lambda zip. See  "Building the lambda function".

2. In AWS create a lambda function using the lambda.zip which can act upon S3 buckets of your choice.
 - This is done in the same fashion as in the attached blog post for the Downloader and Scanner.

3.  Set the Handler to
```
api.lambdaHandleEvent
```

#### Invoking the lambda Endpoint
**Example Json Data Needed For api.lambdaHandleEvent**
```json
{
  "s3Key": "{OBJECT KEY}",
  "s3Bucket": "{BUCKET NAME}"
}
```
**Example of Invoke the lambda event from AWS SDK**

_*Ruby*_

Gems needed:
- aws-sdk-core - required to use aws-sdk
- aws-sdk-lambda - required to invoke the lambda
```ruby
# Configure AWS and create Lambda Client
Aws.config.update(region: REGION)
lambda_client = Aws::Lambda::Client.new({ Args to access required. })

# Build Invoke Payload and JSONify
req_payload = {:s3Bucket => bucket, :s3Key => key}
payload = JSON.generate(req_payload)

# Invoke Lambda as Event (Fire and Forget)
# AWS-SDK : https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/Lambda/Client.html#invoke-instance_method
resp = lambda_client.invoke({function_name: {lambdaName},
        invocation_type: 'Event',
        log_type: 'None',
        payload: payload
        })
```


## Contributors

- [Jamie Lediet](https://github.com/jlediet)

#### License & Acknowledgements

The code is released under the Apache License 2.0, please find the details here:
https://www.apache.org/licenses/LICENSE-2.0

Thanks for the Upside travel team who provided a good blueprint in Python.

https://github.com/upsidetravel/bucket-antivirus-function/