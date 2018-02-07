let DynamoDBInstance = require('./DynamoDBInstance').DynamoDBInstance;
let path = require('path');
let fs = require('fs');


let ServiceDatabaseHandler = function(databaseInfo){
	
	this.table = databaseInfo.table;
	this.dynamoDB = databaseInfo.dynamoDB;
	this.docClient = databaseInfo.docClient;

}


ServiceDatabaseHandler.prototype.bulkInsertDocuments = function(documents, callback){

	let requestItems = [];

	for(let i = 0; i < documents.length; i++){

		requestItems.push({
			PutRequest : {
				Item : documents[i]
			}		
		});

		if(i > 0 && requestItems.length % DynamoDBInstance.MAXIMUM_PUT_REQUEST_ITEMS == 0){
			this._putDocuments(requestItems);
			requestItems = [];
		}

	}

	if(requestItems.length >  0){
		this._putDocuments(requestItems);
	}

}


ServiceDatabaseHandler.prototype._putDocuments = function(requestItems, callback){

	let tableUpdateObject = {};
		
	tableUpdateObject[this.table] = requestItems;

	let requestObject = {
		RequestItems : tableUpdateObject
	}

	this._writeBulkChanges(requestObject, callback);

}


ServiceDatabaseHandler.prototype._writeBulkChanges = function(requestObject, callback){

	let bulkWriteItemCallback = callback;

	if(typeof bulkWriteItemCallback == 'undefined'){

		bulkWriteItemCallback = function(err, data){
			if(err){
				console.log("-----error writing bulk items-----");
				console.log(err, err.stack);
			} else {
				console.log(data);
			}
		}

	}

	this.docClient.batchWrite(requestObject, bulkWriteItemCallback);

}

module.exports.ServiceDatabaseHandler = ServiceDatabaseHandler;

