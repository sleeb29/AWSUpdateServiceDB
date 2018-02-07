let fs = require('fs');
let OUTERGOING_SERVICE_CONFIG_FILE_DIRECTORY = "./outgoing_service_config/";

exports.handler = (event, context, callback) => {

	fs.readdirSync(OUTERGOING_SERVICE_CONFIG_FILE_DIRECTORY).forEach(configFile => {
		
		let serviceInfo = JSON.parse(fs.readFileSync(OUTERGOING_SERVICE_CONFIG_FILE_DIRECTORY + configFile)).serviceInfo;
		serviceInfo.path = serviceInfo.partial_path + process.env[serviceInfo.api_key_environment_variable_name];
		updateServiceDB(serviceInfo, callback);
	
    });

};

let updateServiceDB = function(serviceInfo, callback){

	let apiCallback = function(returnData){

		let ServiceDatabaseHandler = require('./ServiceDatabaseHandler.js').ServiceDatabaseHandler;
		let DynamoDBInstance = require('./DynamoDBInstance.js').DynamoDBInstance;
	
		let documentSchema = JSON.parse(fs.readFileSync(serviceInfo.schema_document));
	
		let dynamoDBInstance = new DynamoDBInstance();

		console.log(returnData.toString());
	
		for(var i = 0; i < documentSchema.tables.length; i++){

			let table = documentSchema.tables[i];
	
			let dataBaseInfo = {
				table : table.TableName,
				dynamoDB : dynamoDBInstance.dynamoDB,
				docClient : dynamoDBInstance.docClient
			};
	
			let DataTransformer = require(serviceInfo.data_format_scripts[table.TableName]).DataTransformer;
			let documents = new DataTransformer().transformResponseToDocument(returnData);
	
			let serviceDatabaseHandler = new ServiceDatabaseHandler(dataBaseInfo);
			serviceDatabaseHandler.bulkInsertDocuments(documents, lambdaCallBack);
	
		}
	
	}

	let InvokeAPIHandler = require("./InvokeAPIHandler.js").InvokeAPIHandler;
	let invokeAPIHandler = new InvokeAPIHandler(serviceInfo);

	invokeAPIHandler.invoke(apiCallback);

}

let lambdaCallBack = function(err, data){

	let returnString = "";
	if(err){
	returnString = err;
	} else {
	returnString = data;
	}

	callback(null, returnString);

}
