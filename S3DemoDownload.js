/*
** Author : Sarbojit Mukherjee
** Date: July 2, 2017
**
** Comment: This program showcase sample code for uploading some sample files (e.g. pdf, image(jpg & png), list/text)
**          from local directory to AWS S3 P2PBazzar.com bucket. This can be modified to be implemented as JavaScript
**          in HTML file. This is to be executed from command line via >>node S3Demo.js <check usage parameters>
**
**          This is a  POC / Demo purpose only. If use as it is, lots of error handling needs to happen.
*/
var BUCKET_NAME = 'p2pbazzar.sandbox.com';
var fs = require('fs');
var aws = require('aws-sdk');
var PDFDocument = require('pdfkit');
aws.config.loadFromPath('./AwsConfig.json');
var s3 = new aws.S3();

// Temporary debug statements - eleminate/comment them later on.
console.log("Starting to download from p2pbazzar.sandbox.com into the local drive ...");

// Check the minimum number of parameters passed. Exit gracefully, if not provided
console.log('process.argv.length: ',  process.argv.length);
if (process.argv.length < 4) noParamsGiven();
else runWithParams();

// Exit gracefully with exit message.
function noParamsGiven() {
  showUsage();
  process.exit(-1);
}

// Catch the input params and call download function
function runWithParams(){
   var remoteFile = process.argv[2];
   var localFile  = process.argv[3];
   downloadFile3(remoteFile, localFile);
}

function downloadFile3(remoteFile, localFile) {
  console.log("In downloadFile function ...");
  var params = {
    Bucket: BUCKET_NAME,
    Key: remoteFile
  };

  var file = require('fs').createWriteStream(localFile);
  s3.getObject(params).createReadStream().on('error', function(err){
    console.log(err);
  }).pipe(file); 
}

// Show the valid input options for the demo. 
function showUsage() {
  console.log('Use the following command line parameters to download from p2pbazzar.sandbox.com:');
  console.log('>> node S3DemoDownload.js <S3 path and file name> <local path and file name>');
  console.log('Example: ');
  console.log('>> node S3DemoDownload.js pdf/test.pdf sandbox/pdf/test1.pdf          OR ..');
  console.log('>> node S3DemoDownload.js image/elephant.jpg sandbox/image/elephant.jpg');
}
