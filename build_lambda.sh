#!/usr/bin/env bash
set -e
LAMBDA_FILE="lambda.zip"
CLAM_VERSION="0.104.1"

rm -f ${LAMBDA_FILE}

mkdir -p clamav

echo "-- Downloading AmazonLinux container --"
docker pull amazonlinux
docker create -i -t -v ${PWD}/clamav:/home/docker  --name s3-antivirus-builder amazonlinux
docker start s3-antivirus-builder

echo "-- Updating, downloading and unpacking clamAV and ClamAV update --"
docker exec -it -w /home/docker s3-antivirus-builder yum install -y cpio yum-utils
docker exec -it -w /home/docker s3-antivirus-builder curl -L -O https://www.clamav.net/downloads/production/clamav-${CLAM_VERSION}.linux.x86_64.rpm -A "Blocking common Linux agents is mean 1.0"
docker exec -it -w /home/docker s3-antivirus-builder /bin/sh -c "rpm2cpio clamav-${CLAM_VERSION}.linux.x86_64.rpm | cpio -idmv"

docker stop s3-antivirus-builder
docker rm s3-antivirus-builder

mkdir ./bin

echo "-- Copying the executables and required libraries --"
cp clamav/usr/local/bin/clamscan clamav/usr/local/bin/freshclam clamav/usr/local/lib64/*.so* bin/.

echo "-- Cleaning up ClamAV folder --"
rm -rf clamav

cp -R ./s3-antivirus/* bin/.

pushd ./bin
zip -r9 ${LAMBDA_FILE} *
popd

cp bin/${LAMBDA_FILE} .

echo "-- Cleaning up bin folder --"
rm -rf bin
