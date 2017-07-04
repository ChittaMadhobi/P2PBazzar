/*
** Author : Sarbojit Mukherjee
** Date: July 2, 2017
**
** Comment: This program showcase sample code for uploading some sample files (e.g. pdf, image(jpg & png), list/text)
**          from local directory to AWS S3 P2PBazzar.com bucket. This can be modified to be implemented as JavaScript
**          in HTML file. This is to be executed from command line via >>node S3Demo.js <check usage parameters>
*/

// Initialize the aws scenario. In general, this should be pickedup from configuration
// file, associated with the environment (sandbox, dev, QA, stage, production); 
var BUCKET_NAME = 'p2pbazzar.sandbox.com';
var fs = require('fs');
var aws = require('aws-sdk');
var PDFDocument = require('pdfkit');
aws.config.loadFromPath('./AwsConfig.json');
var s3 = new aws.S3();

// Temporary debug statements - eleminate/comment them later on.
console.log("Starting to upload in p2pbazzar.sandbox.com ...");

// Check the minimum number of parameters passed. Exit gracefully, if not provided
if (process.argv.length < 3) noParamsGiven();
else runWithParams();

// Exit gracefully with exit message.
function noParamsGiven() {
  showUsage();
  process.exit(-1);
}

// Start the  process -- 
// At this demo, only three content types are used. However, in real world, all the relevant 
// content types should be addressed with reference to the  business model.
// Here, list uses hard coded JSON in the list (in program); For image, the input file 
// and remote file are the same. In case of pdf, the input or local file (that includes relative 
// directory structure) could be different for local and remote. 
function runWithParams(){
    console.log('The p2pBazzar.com S3 Demo Deployer ... input option [' + process.argv[2] + ']');
    if (process.argv[2] === 'list') uploadList();
    else if (process.argv[2] === 'pdf' && process.argv[3] && process.argv[4]) uploadPdf();
    else if (process.argv[2] === 'image' && process.argv[3]) uploadImages();
    else if (process.argv[2] === 'txt' && process.argv[3]) uploadText();
    else {console.log('Input Error: The input option isn\'t recognized or incomplete.');
    process.exit(-1);
    }
}

//Here the parameters of the remote file name and local file names are hard coded. 
// In reality, the remote file name should be in some configuration file
// and input options could be a combination of config files & input parameters. 
function uploadList() {
  uploadFile('resources/lists/options1.json', './resources/lists/options1.json');
}

function uploadText(){
  var remoteFile = process.argv[3];
  var localFile = './' + process.argv[3];
  console.log('Text Upload -- Local File: ', localFile, ' Remote File: ', remoteFile);
  uploadFile(remoteFile, localFile);
}

function uploadPdf() {
  var remoteFile = process.argv[3];
  var localFile = process.argv[4];  
  console.log('Remote File : ', remoteFile, ' local file: ', localFile );
  uploadFile(remoteFile, localFile);
}

// For uploading images
function uploadImages() {
    var imageFileRemote = process.argv[3];
    var imageFileLocal = './' + imageFileRemote;
    console.log('Image File Local: ', imageFileLocal, 'Remote File: ', imageFileRemote );
    uploadFile(imageFileRemote, imageFileLocal); 
}

// This iploads lists 
function uploadFile(remoteFilename, fileName) {
  console.log("Successfully reached uploadFile() !!!", fileName);
  var fileBuffer = fs.readFileSync(fileName);    //.toString() will print out the JSON file
                                                 // to debug to see what exists.  
  // These eventually should be in log file. Verbosity to be controlled by configuration mechanism.                                                  
  var metaData = getContentTypeByFile(fileName);
  console.log("File Content Metadata : ", metaData);


  s3.putObject({
    ACL: 'public-read',
    Bucket: BUCKET_NAME,
    Key: remoteFilename,
    Body: fileBuffer,
    ContentType: metaData
  }, function(error, response) {
    console.log('uploaded file[' + fileName + '] to [' + remoteFilename + '] as [' + metaData + ']');
    console.log(arguments);
  });

  console.log("Crossed s3.putObject function - without error!!!");
}


// Just getting the metadata.This too should be configurable externally unless the 
// content metadata is restricted by business model
function getContentTypeByFile(fileName) {
  var rc = 'application/octet-stream';
  var fileNameLowerCase = fileName.toLowerCase();

console.log('getContentTypebyFile: ', fileNameLowerCase );
  if (fileNameLowerCase.indexOf('.html') >= 0) rc = 'text/html';
  else if (fileNameLowerCase.indexOf('.txt') >= 0) rc = 'text/plain';
  else if (fileNameLowerCase.indexOf('.json') >= 0) rc = 'application/json';
  else if (fileNameLowerCase.indexOf('.png') >= 0) rc = 'image/png';
  else if (fileNameLowerCase.indexOf('.jpg') >= 0) rc = 'image/jpg';
  else if (fileNameLowerCase.indexOf('.pdf') >= 0) rc = 'application/pdf';
  return rc;
}


// Show the valid input options for the demo. 
function showUsage() {
  console.log('Use one of these command line parameters:');
  console.log('If you are uploading pdf file:  pdf remote-dir-and-file-name local-dir-and-file-name' );
  console.log('If you are uploading image file:  images directory-and-file-name');
  console.log('If you are uploading text file:  txt directory-and-file-name');
  console.log('List/json is hard coded in the code to showcase:  list');
  console.log("Note: For pdf remote-path-file-name - same as the relative local path (/pdf/test.pdf) like Linux.");
  console.log("Note: For image and txt specify file name without dot-slash (./) e.g. image/elephant.jpg or txt/test.txt ...");
}