let path = require('path');
let fs = require('fs');
let AWS = require('aws-sdk');

let DynamoDBInstance = function(){

	DynamoDBInstance._updateAWSConfig(AWS);
	this.dynamoDB = new AWS.DynamoDB();
	this.docClient = new AWS.DynamoDB.DocumentClient();

}

DynamoDBInstance.AWS_CONFIG_FILE_PATH = path.join(__dirname, '..', '/config_files/aws_config.json');
DynamoDBInstance.MAXIMUM_PUT_REQUEST_ITEMS = 25;

DynamoDBInstance._updateAWSConfig = function(AWS){

	if (fs.existsSync(DynamoDBInstance.AWS_CONFIG_FILE_PATH)) {

		let awsConfigData = fs.readFileSync(DynamoDBInstance.AWS_CONFIG_FILE_PATH);
		let awsConfigUpdates = JSON.parse(awsConfigData).AWS;

		AWS.config.update(awsConfigUpdates);
		 
	} 

}

module.exports.DynamoDBInstance = DynamoDBInstance;
